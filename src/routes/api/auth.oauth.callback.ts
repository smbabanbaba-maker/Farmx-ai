import { createFileRoute } from "@tanstack/react-router";
import { authCookies, getSupabaseUserFromAccessToken } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/oauth/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { accessToken?: unknown; refreshToken?: unknown };
          const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
          const refreshToken = typeof body.refreshToken === "string" ? body.refreshToken : "";
          if (!accessToken || !refreshToken) {
            return Response.json({ error: "Google did not return a valid sign-in session." }, { status: 400 });
          }

          const user = await getSupabaseUserFromAccessToken(accessToken);
          const response = Response.json(
            { user, message: "Google sign-in completed successfully." },
            { headers: { "Cache-Control": "no-store" } },
          );
          for (const cookie of authCookies(accessToken, refreshToken)) {
            response.headers.append("Set-Cookie", cookie);
          }
          return response;
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Google sign-in could not be completed." },
            { status: 401 },
          );
        }
      },
    },
  },
});
