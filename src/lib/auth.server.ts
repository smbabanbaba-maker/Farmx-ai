import { randomBytes } from "node:crypto";
import { hashToken, ensureSchema, newId, query } from "@/lib/db.server";

const SESSION_COOKIE = "farmx_session";
const SESSION_DAYS = 30;

type UserRow = {
  id: string;
  email: string;
  password_hash?: string;
  plan?: string;
  plan_expires_at?: string | null;
};

function cookieValue(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`))?.[1] ?? null;
}

export function bearerOrCookie(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : cookieValue(request);
}

export function sessionCookie(token: string, maxAge = SESSION_DAYS * 24 * 60 * 60) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}`;
}

export async function createUser(email: string, passwordHash: string) {
  await ensureSchema();
  const id = newId();
  const result = await query<UserRow>(
    "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email",
    [id, email, passwordHash],
  );
  await query("INSERT INTO profiles (id, email) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING", [
    id,
    email,
  ]);
  return result.rows[0];
}

export async function findUserByEmail(email: string) {
  await ensureSchema();
  const result = await query<UserRow>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  return result.rows[0] ?? null;
}

export async function createSession(userId: string) {
  await ensureSchema();
  const token = randomBytes(32).toString("base64url");
  await query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')",
    [hashToken(token), userId],
  );
  return token;
}

export async function destroySession(request: Request) {
  const token = bearerOrCookie(request);
  if (token) await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function getSessionUser(request: Request) {
  const token = bearerOrCookie(request);
  if (!token) return null;
  await ensureSchema();
  const result = await query<UserRow>(
    `SELECT u.id, u.email, p.plan, p.plan_expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     LEFT JOIN profiles p ON p.id = u.id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [hashToken(token)],
  );
  return result.rows[0] ?? null;
}

export { SESSION_COOKIE };
