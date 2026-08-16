import { createFileRoute } from "@tanstack/react-router";
import { getViewer, SIGN_IN_REQUIRED } from "@/lib/entitlements.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { PLAN_PRICE_KOBO, isPaidPlan } from "@/lib/plans";

export const Route = createFileRoute("/api/pay/init")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const viewer = await getViewer(request);
        if (!viewer) return new Response(SIGN_IN_REQUIRED, { status: 401 });

        const { plan, callbackUrl } = (await request.json()) as {
          plan?: string;
          callbackUrl?: string;
        };
        if (!plan || !isPaidPlan(plan)) {
          return new Response("Invalid plan", { status: 400 });
        }

        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) return new Response("Payments are not configured.", { status: 500 });

        const amount = PLAN_PRICE_KOBO[plan];
        const reference = `farmx_${plan}_${viewer.userId.slice(0, 8)}_${Date.now()}`;

        const resp = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: viewer.email,
            amount,
            reference,
            currency: "NGN",
            callback_url: callbackUrl,
            channels: ["card", "bank", "ussd", "bank_transfer", "qr", "mobile_money"],
            metadata: { user_id: viewer.userId, plan },
          }),
        });

        const body = (await resp.json().catch(() => ({}))) as {
          status?: boolean;
          message?: string;
          data?: { authorization_url?: string; reference?: string };
        };

        if (!resp.ok || !body.status || !body.data?.authorization_url) {
          console.error("Paystack init failed", resp.status, body.message);
          return new Response(body.message ?? "Could not start payment.", { status: 502 });
        }

        await supabaseAdmin.from("payments").insert({
          user_id: viewer.userId,
          email: viewer.email,
          reference,
          plan,
          amount_kobo: amount,
          status: "pending",
        });

        return Response.json({
          authorization_url: body.data.authorization_url,
          reference,
        });
      },
    },
  },
});
