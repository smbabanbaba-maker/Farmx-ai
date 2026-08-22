import { createFileRoute } from "@tanstack/react-router";
import { getGoogleOAuthAuthorizationUrl } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/google")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        return Response.redirect(getGoogleOAuthAuthorizationUrl(`${origin}/auth-callback`), 302);
      },
    },
  },
});
