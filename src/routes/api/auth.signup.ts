import { createFileRoute } from "@tanstack/react-router";
import { authCookies, signUpWithSupabase } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: unknown; password?: unknown };
          const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          const password = typeof body.password === "string" ? body.password : "";
          if (!email || password.length < 6) {
            return Response.json(
              { error: "Enter a valid email and a password of at least 6 characters." },
              { status: 400 },
            );
          }
          const data = await signUpWithSupabase(email, password);
          if (!data.user) {
            return Response.json(
              { error: "Supabase did not create the account." },
              { status: 400 },
            );
          }
          if (!data.session) {
            return Response.json({
              requiresEmailConfirmation: true,
              user: { id: data.user.id, email },
            });
          }
          const response = Response.json(
            { user: { id: data.user.id, email } },
            { headers: { "Cache-Control": "no-store" } },
          );
          for (const cookie of authCookies(data.session.access_token, data.session.refresh_token)) {
            response.headers.append("Set-Cookie", cookie);
          }
          return response;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to create account.";
          const isCooldown =
            /security purposes|after \d+ seconds|rate limit|too many requests/i.test(message);
          return Response.json(
            {
              error: isCooldown
                ? "Supabase yana neman ka jira kaɗan kafin sake register. Jira seconds 60, sannan ka gwada sau ɗaya kawai."
                : message,
            },
            { status: isCooldown ? 429 : 400 },
          );
        }
      },
    },
  },
});
