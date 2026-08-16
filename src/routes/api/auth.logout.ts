import { createFileRoute } from "@tanstack/react-router";
import { clearAuthCookies, signOutFromSupabase } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await signOutFromSupabase(request);
        const response = Response.json(
          { success: true },
          { headers: { "Cache-Control": "no-store" } },
        );
        for (const cookie of clearAuthCookies()) response.headers.append("Set-Cookie", cookie);
        return response;
      },
    },
  },
});
