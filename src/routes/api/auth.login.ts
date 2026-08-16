import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { createSession, findUserByEmail, sessionCookie } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email?: unknown; password?: unknown };
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        const user = await findUserByEmail(email);
        if (!user?.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
          return Response.json({ error: "Invalid email or password." }, { status: 401 });
        }
        const token = await createSession(user.id);
        return Response.json(
          { user: { id: user.id, email: user.email } },
          { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
