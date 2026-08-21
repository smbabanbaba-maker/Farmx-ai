import { createFileRoute } from "@tanstack/react-router";
import { updateSupabasePassword } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/update-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { accessToken?: unknown; password?: unknown };
          const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
          const password = typeof body.password === "string" ? body.password : "";
          if (!accessToken) {
            return Response.json({ error: "Password reset link ɗin bai inganta ba ko ya ƙare." }, { status: 401 });
          }
          if (password.length < 6) {
            return Response.json({ error: "Password dole ya zama akalla haruffa 6." }, { status: 400 });
          }

          await updateSupabasePassword(accessToken, password);
          return Response.json({ message: "An canza password. Yanzu zaka iya Sign in." });
        } catch (error) {
          const message = error instanceof Error ? error.message : "An kasa canza password.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
