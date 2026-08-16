import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { isPaidPlan } from "@/lib/plans";

export type PaystackTx = {
  status?: string;
  reference?: string;
  amount?: number;
  channel?: string;
  paid_at?: string;
  metadata?: { plan?: string; user_id?: string };
};

/** Marks a payment successful and upgrades the buyer's plan for 30 days. */
export async function applySuccessfulPayment(tx: PaystackTx): Promise<boolean> {
  const reference = tx.reference;
  if (!reference || tx.status !== "success") return false;

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id, user_id, plan, status")
    .eq("reference", reference)
    .maybeSingle();

  const plan = payment?.plan ?? tx.metadata?.plan;
  const userId = payment?.user_id ?? tx.metadata?.user_id;
  if (!plan || !isPaidPlan(plan) || !userId) return false;

  if (payment?.status !== "success") {
    await supabaseAdmin
      .from("payments")
      .update({
        status: "success",
        channel: tx.channel ?? null,
        paid_at: tx.paid_at ?? new Date().toISOString(),
      })
      .eq("reference", reference);
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  await supabaseAdmin
    .from("profiles")
    .update({ plan, plan_expires_at: expires.toISOString() })
    .eq("id", userId);

  return true;
}

/** Asks Paystack for the authoritative state of a transaction. */
export async function verifyTransaction(reference: string): Promise<PaystackTx | null> {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret) return null;
  const resp = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  if (!resp.ok) {
    console.error("Paystack verify failed", resp.status, await resp.text().catch(() => ""));
    return null;
  }
  const body = (await resp.json()) as { data?: PaystackTx };
  return body.data ?? null;
}
