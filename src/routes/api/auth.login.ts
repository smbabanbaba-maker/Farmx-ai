import { createFileRoute } from "@tanstack/react-router";
import { authCookies, getSupabaseSessionTokens, signInWithSupabase } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: unknown; password?: unknown };
          const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          const password = typeof body.password === "string" ? body.password : "";
          if (!email || !password) {
            return Response.json({ error: "Enter your email and password." }, { status: 400 });
          }
          const data = await signInWithSupabase(email, password);
          const sessionTokens = getSupabaseSessionTokens(data);
          if (!data.user || !sessionTokens) {
            return Response.json({ error: "Supabase did not return a session." }, { status: 401 });
          }
          const response = Response.json(
            { user: { id: data.user.id, email: data.user.email ?? email } },
            { headers: { "Cache-Control": "no-store" } },
          );
          for (const cookie of authCookies(sessionTokens.accessToken, sessionTokens.refreshToken)) {
            response.headers.append("Set-Cookie", cookie);
          }
          return response;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to sign in.";
          const isCooldown =
            /security purposes|after \d+ seconds|rate limit|too many requests/i.test(message);
          return Response.json(
            {
              error: isCooldown
                ? "Too many sign-in attempts. Wait 60 seconds, then try once more."
                : message,
            },
            { status: isCooldown ? 429 : 401 },
          );
        }
      },
    },
  },
});
