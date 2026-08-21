import { createFileRoute } from "@tanstack/react-router";
import { requestPasswordRecovery } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { email?: unknown };
          const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return Response.json({ error: "Shigar da valid email address." }, { status: 400 });
          }

          const origin = new URL(request.url).origin;
          await requestPasswordRecovery(email, `${origin}/reset-password`);
          return Response.json({
            message:
              "Idan email ɗin yana da FarmX AI account, an tura password-reset link zuwa inbox ɗinka. Duba Spam folder ma.",
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "An kasa tura password-reset email.";
          const isCooldown = /security purposes|after \d+ seconds|rate limit|too many requests/i.test(message);
          return Response.json(
            {
              error: isCooldown
                ? "Jira seconds 60 kafin sake neman password-reset link."
                : message,
            },
            { status: isCooldown ? 429 : 400 },
          );
        }
      },
    },
  },
});
