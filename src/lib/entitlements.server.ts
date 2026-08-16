import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PLAN_LIMITS, type PlanId } from "@/lib/plans";

export type Viewer = {
  userId: string;
  email: string;
  plan: PlanId;
};

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Resolve the signed-in user from the Authorization bearer token. */
export async function getViewer(request: Request): Promise<Viewer | null> {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;

  const userId = data.user.id;
  const email = data.user.email ?? "";

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await supabaseAdmin.from("profiles").insert({ id: userId, email }).select().maybeSingle();
    return { userId, email, plan: "free" };
  }

  let plan = (profile.plan ?? "free") as PlanId;
  if (
    plan !== "free" &&
    profile.plan_expires_at &&
    new Date(profile.plan_expires_at) < new Date()
  ) {
    plan = "free";
    await supabaseAdmin.from("profiles").update({ plan: "free" }).eq("id", userId);
  }
  return { userId, email, plan };
}

export type UsageKind = "messages" | "scans";

export type QuotaResult =
  | { ok: true; used: number; limit: number | null }
  | { ok: false; used: number; limit: number; message: string };

/** Check the daily quota and, when allowed, count this use. */
export async function consumeQuota(viewer: Viewer, kind: UsageKind): Promise<QuotaResult> {
  const limits = PLAN_LIMITS[viewer.plan];
  const limit = kind === "messages" ? limits.messagesPerDay : limits.scansPerDay;
  const day = utcDay();

  const { data: row } = await supabaseAdmin
    .from("usage_counters")
    .select("id, messages, scans")
    .eq("user_id", viewer.userId)
    .eq("day", day)
    .maybeSingle();

  const used = row ? (kind === "messages" ? row.messages : row.scans) : 0;

  if (limit !== null && used >= limit) {
    return {
      ok: false,
      used,
      limit,
      message:
        kind === "messages"
          ? `Ka kai iyakar tambayoyi ${limit} na yau a shirin ${viewer.plan.toUpperCase()}. Ka haɓaka zuwa GO ko PRO domin ci gaba. / You have reached your daily limit of ${limit} AI messages on the ${viewer.plan.toUpperCase()} plan. Upgrade to GO or PRO to continue.`
          : `Ka kai iyakar bincike-hoto ${limit} na yau. Ka haɓaka shirinka. / You have reached your daily limit of ${limit} plant scans. Upgrade your plan to continue.`,
    };
  }

  if (row) {
    const patch = kind === "messages" ? { messages: used + 1 } : { scans: used + 1 };
    await supabaseAdmin.from("usage_counters").update(patch).eq("id", row.id);
  } else {
    await supabaseAdmin.from("usage_counters").insert({
      user_id: viewer.userId,
      day,
      messages: kind === "messages" ? 1 : 0,
      scans: kind === "scans" ? 1 : 0,
    });
  }

  return { ok: true, used: used + 1, limit };
}

export const SIGN_IN_REQUIRED =
  "Ka shiga account ɗinka domin amfani da FarmX AI. / Please sign in to use FarmX AI.";

/** Free messages a signed-out visitor gets per day, per device. */
export const GUEST_DAILY_MESSAGES = 5;

export const GUEST_LIMIT_MESSAGE = `Ka gama tambayoyi ${GUEST_DAILY_MESSAGES} na baƙo na yau. Ka yi rijista kyauta domin ci gaba. / You have used your ${GUEST_DAILY_MESSAGES} free guest messages for today. Please sign in (free) to continue.`;

export const GUEST_IMAGE_MESSAGE =
  "Bincike-hoto yana buƙatar shiga account. Ka yi rijista kyauta. / Photo analysis requires an account. Please sign in — it's free.";

/** Meter a signed-out visitor by device id. */
export async function consumeGuestQuota(guestId: string): Promise<QuotaResult> {
  const day = utcDay();
  const id = guestId.slice(0, 64);

  const { data: row } = await supabaseAdmin
    .from("guest_usage")
    .select("id, messages")
    .eq("guest_id", id)
    .eq("day", day)
    .maybeSingle();

  const used = row?.messages ?? 0;
  if (used >= GUEST_DAILY_MESSAGES) {
    return { ok: false, used, limit: GUEST_DAILY_MESSAGES, message: GUEST_LIMIT_MESSAGE };
  }

  if (row) {
    await supabaseAdmin
      .from("guest_usage")
      .update({ messages: used + 1 })
      .eq("id", row.id);
  } else {
    await supabaseAdmin.from("guest_usage").insert({ guest_id: id, day, messages: 1 });
  }
  return { ok: true, used: used + 1, limit: GUEST_DAILY_MESSAGES };
}
