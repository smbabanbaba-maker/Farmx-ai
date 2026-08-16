import { createFileRoute } from "@tanstack/react-router";
import { getViewer, SIGN_IN_REQUIRED } from "@/lib/entitlements.server";
import { applySuccessfulPayment, verifyTransaction } from "@/lib/paystack.server";

export const Route = createFileRoute("/api/pay/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const viewer = await getViewer(request);
        if (!viewer) return new Response(SIGN_IN_REQUIRED, { status: 401 });

        const { reference } = (await request.json()) as { reference?: string };
        if (!reference) return new Response("reference required", { status: 400 });

        const tx = await verifyTransaction(reference);
        if (!tx) return Response.json({ status: "unknown" });

        if (tx.status === "success") {
          const applied = await applySuccessfulPayment(tx);
          return Response.json({ status: applied ? "success" : "mismatch" });
        }
        return Response.json({ status: tx.status ?? "pending" });
      },
    },
  },
});
