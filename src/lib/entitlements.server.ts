import { PLAN_LIMITS, type PlanId } from "@/lib/plans";
import { getSessionUser } from "@/lib/auth.server";
import { supabaseRpc } from "@/lib/supabase-data.server";

export type Viewer = { userId: string; email: string; plan: PlanId };

export async function getViewer(request: Request): Promise<Viewer | null> {
  const user = await getSessionUser(request);
  if (!user) return null;
  const plan = ((user.plan ?? "free") as PlanId) || "free";
  if (plan !== "free" && user.plan_expires_at && new Date(user.plan_expires_at) < new Date()) {
    return { userId: user.id, email: user.email, plan: "free" };
  }
  return { userId: user.id, email: user.email, plan };
}

export type UsageKind = "messages" | "scans" | "images";
export type QuotaResult =
  | { ok: true; used: number; limit: number | null }
  | { ok: false; used: number; limit: number; message: string };

export async function consumeQuota(
  request: Request,
  viewer: Viewer,
  kind: UsageKind,
): Promise<QuotaResult> {
  try {
    const rows = await supabaseRpc<Array<{ used: number; plan_limit: number | null }>>(
      request,
      "increment_usage",
      { kind },
    );
    const result = rows?.[0];
    if (!result) throw new Error("Supabase quota RPC returned no row.");
    return { ok: true, used: result.used, limit: result.plan_limit };
  } catch (error) {
    console.warn("Supabase quota unavailable; continuing without quota persistence", error);
    const limit =
      kind === "messages"
        ? PLAN_LIMITS[viewer.plan].messagesPerDay
        : kind === "scans"
          ? PLAN_LIMITS[viewer.plan].scansPerDay
          : PLAN_LIMITS[viewer.plan].imagesPerDay;
    return { ok: true, used: 0, limit };
  }
}

export const SIGN_IN_REQUIRED =
  "Ka shiga account ɗinka domin amfani da FarmX AI. / Please sign in to use FarmX AI.";
export const GUEST_DAILY_MESSAGES = 5;
export const GUEST_LIMIT_MESSAGE = `Ka gama tambayoyi ${GUEST_DAILY_MESSAGES} na baƙo na yau. Ka yi rijista kyauta domin ci gaba. / You have used your ${GUEST_DAILY_MESSAGES} free guest messages for today. Please sign in (free) to continue.`;
export const GUEST_IMAGE_MESSAGE =
  "Bincike-hoto yana buƙatar shiga account. Ka yi rijista kyauta. / Photo analysis requires an account. Please sign in — it's free.";

export async function consumeGuestQuota(_guestId: string): Promise<QuotaResult> {
  return { ok: true, used: 0, limit: GUEST_DAILY_MESSAGES };
}
