CREATE TABLE public.guest_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id text NOT NULL,
  day date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc')::date),
  messages integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guest_id, day)
);
GRANT ALL ON public.guest_usage TO service_role;
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_guest_usage_updated_at BEFORE UPDATE ON public.guest_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();