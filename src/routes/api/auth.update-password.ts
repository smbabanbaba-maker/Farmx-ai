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
            return Response.json({ error: "This password reset link is invalid or has expired." }, { status: 401 });
          }
          if (password.length < 6) {
            return Response.json({ error: "Your password must be at least 6 characters long." }, { status: 400 });
          }

          await updateSupabasePassword(accessToken, password);
          return Response.json({ message: "Your password has been updated. You can now sign in." });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to update your password.";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
