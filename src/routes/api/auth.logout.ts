import { createFileRoute } from "@tanstack/react-router";
import { destroySession, sessionCookie } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await destroySession(request);
        return Response.json(
          { ok: true },
          { headers: { "Set-Cookie": sessionCookie("", 0), "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
