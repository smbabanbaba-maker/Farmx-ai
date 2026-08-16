import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { getSessionUser } from "@/lib/auth.server";
import { ensureSchema, query } from "@/lib/db.server";

export type Viewer = { userId: string; email: string; plan: PlanId };

export async function getViewer(request: Request): Promise<Viewer | null> {
  const user = await getSessionUser(request);
  if (!user) return null;
  const plan = ((user.plan ?? "free") as PlanId) || "free";
  if (plan !== "free" && user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
    await ensureSchema();
    await query("UPDATE profiles SET plan = 'free', plan_expires_at = NULL WHERE id = $1", [
      user.id,
    ]);
    return { userId: user.id, email: user.email, plan: "free" };
  }
  return { userId: user.id, email: user.email, plan };
}

export type UsageKind = "messages" | "scans";
export type QuotaResult =
  | { ok: true; used: number; limit: number | null }
  | { ok: false; used: number; limit: number; message: string };

export async function consumeQuota(viewer: Viewer, kind: UsageKind): Promise<QuotaResult> {
  await ensureSchema();
  const limits = PLAN_LIMITS[viewer.plan];
  const limit = kind === "messages" ? limits.messagesPerDay : limits.scansPerDay;
  const column = kind === "messages" ? "messages" : "scans";
  const result = await query<{ messages: number; scans: number }>(
    `INSERT INTO usage_counters (user_id, day, messages, scans)
     VALUES ($1, CURRENT_DATE, $2, $3)
     ON CONFLICT (user_id, day) DO UPDATE SET ${column} = usage_counters.${column} + 1
     RETURNING messages, scans`,
    [viewer.userId, kind === "messages" ? 1 : 0, kind === "scans" ? 1 : 0],
  );
  const used = kind === "messages" ? result.rows[0].messages : result.rows[0].scans;
  if (limit !== null && used > limit) {
    await query(
      `UPDATE usage_counters SET ${column} = ${column} - 1 WHERE user_id = $1 AND day = CURRENT_DATE`,
      [viewer.userId],
    );
    return {
      ok: false,
      used: used - 1,
      limit,
      message:
        kind === "messages"
          ? `Ka kai iyakar tambayoyi ${limit} na yau a shirin ${viewer.plan.toUpperCase()}. Ka haɓaka zuwa GO ko PRO domin ci gaba. / You have reached your daily limit of ${limit} AI messages on the ${viewer.plan.toUpperCase()} plan. Upgrade to GO or PRO to continue.`
          : `Ka kai iyakar bincike-hoto ${limit} na yau. Ka haɓaka shirinka. / You have reached your daily limit of ${limit} plant scans. Upgrade your plan to continue.`,
    };
  }
  return { ok: true, used, limit };
}

export const SIGN_IN_REQUIRED =
  "Ka shiga account ɗinka domin amfani da FarmX AI. / Please sign in to use FarmX AI.";
export const GUEST_DAILY_MESSAGES = 5;
export const GUEST_LIMIT_MESSAGE = `Ka gama tambayoyi ${GUEST_DAILY_MESSAGES} na baƙo na yau. Ka yi rijista kyauta domin ci gaba. / You have used your ${GUEST_DAILY_MESSAGES} free guest messages for today. Please sign in (free) to continue.`;
export const GUEST_IMAGE_MESSAGE =
  "Bincike-hoto yana buƙatar shiga account. Ka yi rijista kyauta. / Photo analysis requires an account. Please sign in — it's free.";

export async function consumeGuestQuota(guestId: string): Promise<QuotaResult> {
  await ensureSchema();
  const id = guestId.slice(0, 64);
  const result = await query<{ messages: number }>(
    `INSERT INTO guest_usage (guest_id, day, messages) VALUES ($1, CURRENT_DATE, 1)
     ON CONFLICT (guest_id, day) DO UPDATE SET messages = guest_usage.messages + 1
     RETURNING messages`,
    [id],
  );
  const used = result.rows[0].messages;
  if (used > GUEST_DAILY_MESSAGES) {
    await query(
      "UPDATE guest_usage SET messages = messages - 1 WHERE guest_id = $1 AND day = CURRENT_DATE",
      [id],
    );
    return { ok: false, used: used - 1, limit: GUEST_DAILY_MESSAGES, message: GUEST_LIMIT_MESSAGE };
  }
  return { ok: true, used, limit: GUEST_DAILY_MESSAGES };
}
