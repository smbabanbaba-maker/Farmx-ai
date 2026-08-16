import { ensureSchema, query } from "@/lib/db.server";
import { isPaidPlan, type PlanId } from "@/lib/plans";

export type PaystackTx = {
  status?: string;
  reference?: string;
  amount?: number;
  channel?: string;
  paid_at?: string;
  metadata?: { plan?: string; user_id?: string };
};

export async function applySuccessfulPayment(tx: PaystackTx): Promise<boolean> {
  const reference = tx.reference;
  if (!reference || tx.status !== "success") return false;
  await ensureSchema();
  const result = await query<{ user_id: string; plan: string; status: string }>(
    "SELECT user_id, plan, status FROM payments WHERE reference = $1",
    [reference],
  );
  const payment = result.rows[0];
  const plan = (payment?.plan ?? tx.metadata?.plan) as PlanId | undefined;
  const userId = payment?.user_id ?? tx.metadata?.user_id;
  if (!plan || !isPaidPlan(plan) || !userId) return false;

  if (payment?.status !== "success") {
    await query(
      "UPDATE payments SET status = 'success', channel = $2, paid_at = COALESCE($3::timestamptz, NOW()) WHERE reference = $1",
      [reference, tx.channel ?? null, tx.paid_at ?? null],
    );
  }
  await query(
    "UPDATE profiles SET plan = $2, plan_expires_at = NOW() + INTERVAL '30 days' WHERE id = $1",
    [userId, plan],
  );
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
