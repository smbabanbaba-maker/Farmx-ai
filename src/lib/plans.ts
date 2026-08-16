export type PlanId = "free" | "go" | "pro";

export type PlanLimits = {
  /** AI chat messages per day. null = unlimited */
  messagesPerDay: number | null;
  /** Plant scans / image analysis per day. null = unlimited */
  scansPerDay: number | null;
  /** AI image generation per day. 0 = not available */
  imagesPerDay: number;
  voice: boolean;
  pdfReports: boolean;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { messagesPerDay: 10, scansPerDay: 5, imagesPerDay: 0, voice: false, pdfReports: false },
  go: { messagesPerDay: 100, scansPerDay: 30, imagesPerDay: 10, voice: true, pdfReports: true },
  pro: {
    messagesPerDay: null,
    scansPerDay: null,
    imagesPerDay: 100,
    voice: true,
    pdfReports: true,
  },
};

/** Price in kobo (Paystack works in kobo). */
export const PLAN_PRICE_KOBO: Record<Exclude<PlanId, "free">, number> = {
  go: 750_000,
  pro: 2_500_000,
};

export const PLAN_LABEL: Record<PlanId, string> = {
  free: "FREE",
  go: "GO",
  pro: "PRO",
};

export function isPaidPlan(plan: string): plan is Exclude<PlanId, "free"> {
  return plan === "go" || plan === "pro";
}
