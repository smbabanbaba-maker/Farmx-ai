create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  plan text not null default 'free' check (plan in ('free', 'go', 'pro')),
  plan_expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_threads (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  pinned boolean not null default false,
  messages jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists chat_threads_user_updated_idx on public.chat_threads(user_id, updated_at desc);

create table if not exists public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null default current_date,
  messages integer not null default 0,
  scans integer not null default 0,
  images integer not null default 0,
  primary key (user_id, day)
);

create table if not exists public.payments (
  reference text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  plan text not null check (plan in ('go', 'pro')),
  amount_kobo integer not null,
  status text not null default 'pending',
  channel text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.increment_usage(kind text)
returns table(used integer, plan_limit integer)
language plpgsql
security definer set search_path = public
as $$
declare
  current_plan text;
  current_used integer;
  limit_value integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select coalesce(p.plan, 'free') into current_plan from public.profiles p where p.id = auth.uid();
  if current_plan is null then current_plan := 'free'; end if;
  limit_value := case when kind = 'scans' then case current_plan when 'free' then 5 when 'go' then 30 else null end
                 when kind = 'images' then case current_plan when 'free' then 2 when 'go' then 10 else 100 end
                 else case current_plan when 'free' then 10 when 'go' then 100 else null end end;
  insert into public.usage_counters (user_id, day, messages, scans, images)
  values (auth.uid(), current_date, case when kind = 'messages' then 1 else 0 end, case when kind = 'scans' then 1 else 0 end, case when kind = 'images' then 1 else 0 end)
  on conflict (user_id, day) do update set
    messages = usage_counters.messages + case when kind = 'messages' then 1 else 0 end,
    scans = usage_counters.scans + case when kind = 'scans' then 1 else 0 end,
    images = usage_counters.images + case when kind = 'images' then 1 else 0 end;
  select case kind when 'scans' then scans when 'images' then images else messages end into current_used
  from public.usage_counters where user_id = auth.uid() and day = current_date;
  if limit_value is not null and current_used > limit_value then
    update public.usage_counters set
      messages = messages - case when kind = 'messages' then 1 else 0 end,
      scans = scans - case when kind = 'scans' then 1 else 0 end,
      images = images - case when kind = 'images' then 1 else 0 end
    where user_id = auth.uid() and day = current_date;
    raise exception 'daily quota reached';
  end if;
  used := current_used; plan_limit := limit_value; return next;
end;
$$;

grant execute on function public.increment_usage(text) to authenticated;

enable row level security on public.profiles;
enable row level security on public.chat_threads;
enable row level security on public.usage_counters;
enable row level security on public.payments;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

drop policy if exists threads_own_all on public.chat_threads;
create policy threads_own_all on public.chat_threads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists usage_own_select on public.usage_counters;
create policy usage_own_select on public.usage_counters for select using (auth.uid() = user_id);

drop policy if exists payments_own_select on public.payments;
create policy payments_own_select on public.payments for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('farmx-images', 'farmx-images', true)
on conflict (id) do update set public = true;

drop policy if exists farmx_images_public_read on storage.objects;
create policy farmx_images_public_read on storage.objects for select using (bucket_id = 'farmx-images');
