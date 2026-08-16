import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { createSession, createUser, findUserByEmail, sessionCookie } from "@/lib/auth.server";

export const Route = createFileRoute("/api/auth/signup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { email?: unknown; password?: unknown };
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
        const password = typeof body.password === "string" ? body.password : "";
        if (!email || password.length < 6) {
          return Response.json(
            { error: "Enter a valid email and a password of at least 6 characters." },
            { status: 400 },
          );
        }
        if (await findUserByEmail(email)) {
          return Response.json(
            { error: "An account with this email already exists." },
            { status: 409 },
          );
        }
        const user = await createUser(email, await bcrypt.hash(password, 12));
        const token = await createSession(user.id);
        return Response.json(
          { user: { id: user.id, email: user.email } },
          { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
