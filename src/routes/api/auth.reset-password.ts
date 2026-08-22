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
            return Response.json({ error: "Enter a valid email address." }, { status: 400 });
          }

          const origin = new URL(request.url).origin;
          await requestPasswordRecovery(email, `${origin}/reset-password`);
          return Response.json({
            message:
              "If this email has a FarmX AI account, a password reset link has been sent. Check your inbox and spam folder.",
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to send a password reset email.";
          const isCooldown = /security purposes|after \d+ seconds|rate limit|too many requests/i.test(message);
          return Response.json(
            {
              error: isCooldown
                ? "Please wait 60 seconds before requesting another password reset link."
                : message,
            },
            { status: isCooldown ? 429 : 400 },
          );
        }
      },
    },
  },
});
