import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        return Response.json(
          { user: user ? { id: user.id, email: user.email } : null, authenticated: Boolean(user) },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
