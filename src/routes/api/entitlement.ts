import { createFileRoute } from "@tanstack/react-router";
import { getViewer } from "@/lib/entitlements.server";

export const Route = createFileRoute("/api/entitlement")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const viewer = await getViewer(request);
        return Response.json(
          { plan: viewer?.plan ?? "free", planExpiresAt: null },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
