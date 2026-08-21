import { createFileRoute } from "@tanstack/react-router";
import { authCookies, getSupabaseSessionTokens, signUpWithSupabase } from "@/lib/auth.server";

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
          const origin = new URL(request.url).origin;
          const data = await signUpWithSupabase(email, password, `${origin}/auth`);
          if (!data.user) {
            return Response.json(
              {
                error:
                  "An kasa ƙirƙirar sabon account da wannan email. Idan kana da account ɗin a baya, danna Sign in. Idan ba haka ba, jira seconds 60 sannan ka sake gwadawa sau ɗaya.",
              },
              { status: 409 },
            );
          }
          if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
            return Response.json(
              {
                error:
                  "Wannan email yana da FarmX AI account a baya. Danna Sign in maimakon Create account.",
              },
              { status: 409 },
            );
          }
          const sessionTokens = getSupabaseSessionTokens(data);
          if (!sessionTokens) {
            return Response.json({
              requiresEmailConfirmation: true,
              user: { id: data.user.id, email },
            });
          }
          const response = Response.json(
            { user: { id: data.user.id, email } },
            { headers: { "Cache-Control": "no-store" } },
          );
          for (const cookie of authCookies(sessionTokens.accessToken, sessionTokens.refreshToken)) {
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
