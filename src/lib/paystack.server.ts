import { supabaseAdminRequest } from "@/lib/supabase-data.server";
import { isPaidPlan, type PlanId } from "@/lib/plans";

export type PaystackTx = {
  status?: string;
  reference?: string;
  amount?: number;
  channel?: string;
  paid_at?: string;
  metadata?: { plan?: string; user_id?: string };
};

type StoredPayment = { user_id: string; plan: string; status: string };

export async function applySuccessfulPayment(tx: PaystackTx): Promise<boolean> {
  const reference = tx.reference;
  if (!reference || tx.status !== "success") return false;

  const payments = await supabaseAdminRequest<StoredPayment[]>(
    `payments?reference=eq.${encodeURIComponent(reference)}&select=user_id,plan,status&limit=1`,
  );
  const payment = payments[0];
  const plan = (payment?.plan ?? tx.metadata?.plan) as PlanId | undefined;
  const userId = payment?.user_id ?? tx.metadata?.user_id;
  if (!plan || !isPaidPlan(plan) || !userId) return false;

  if (payment?.status !== "success") {
    await supabaseAdminRequest(`payments?reference=eq.${encodeURIComponent(reference)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: "success",
        channel: tx.channel ?? null,
        paid_at: tx.paid_at ?? new Date().toISOString(),
      }),
    });
  }

  await supabaseAdminRequest(`profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      plan,
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  });
  return true;
}

export async function verifyTransaction(reference: string): Promise<PaystackTx | null> {
  const secret = process.env["PAYSTACK_SECRET_KEY"];
  if (!secret) return null;
  const resp = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    },
  );
  if (!resp.ok) {
    console.error("Paystack verify failed", resp.status, await resp.text().catch(() => ""));
    return null;
  }
  const body = (await resp.json()) as { data?: PaystackTx };
  return body.data ?? null;
}
