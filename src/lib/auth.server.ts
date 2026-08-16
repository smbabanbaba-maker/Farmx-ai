const ACCESS_COOKIE = "farmx_access_token";
const REFRESH_COOKIE = "farmx_refresh_token";
const SESSION_COOKIE = "farmx_session";

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  session?: { access_token: string; refresh_token: string };
  user?: { id: string; email?: string | null };
  error?: string;
  error_description?: string;
  msg?: string;
};

type SessionUser = {
  id: string;
  email: string;
  plan?: string;
  plan_expires_at?: string | null;
};

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase authentication is not configured. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return { url: url.replace(/\/$/, ""), key };
}

function supabaseHeaders(accessToken?: string) {
  const { key } = getSupabaseConfig();
  return {
    apikey: key,
    Authorization: `Bearer ${accessToken ?? key}`,
    "Content-Type": "application/json",
  };
}

async function readAuthResponse(response: Response) {
  const body = (await response.json().catch(() => ({}))) as SupabaseAuthResponse;
  if (!response.ok) {
    throw new Error(
      body.error_description ?? body.msg ?? body.error ?? "Supabase authentication failed.",
    );
  }
  return body;
}

function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))?.[1] ?? null;
}

function cookieOptions(maxAge: number) {
  return `Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}`;
}

export function authCookies(accessToken: string, refreshToken: string) {
  const options = cookieOptions(60 * 60 * 24 * 30);
  return [
    `${ACCESS_COOKIE}=${accessToken}; ${options}`,
    `${REFRESH_COOKIE}=${refreshToken}; ${options}`,
  ];
}

export function clearAuthCookies() {
  const options = cookieOptions(0);
  return [`${ACCESS_COOKIE}=; ${options}`, `${REFRESH_COOKIE}=; ${options}`];
}

/** Backward-compatible test helper; application auth uses the two Supabase cookies above. */
export function sessionCookie(token: string, maxAge = 60 * 60 * 24 * 30) {
  return `${SESSION_COOKIE}=${token}; ${cookieOptions(maxAge)}`;
}

export async function signUpWithSupabase(email: string, password: string) {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return readAuthResponse(response);
}

export async function signInWithSupabase(email: string, password: string) {
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: supabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return readAuthResponse(response);
}

export async function signOutFromSupabase(_request: Request) {
  return undefined;
}

export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const accessToken = cookieValue(request, ACCESS_COOKIE);
  if (!accessToken) return null;
  const { url } = getSupabaseConfig();
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: supabaseHeaders(accessToken),
  });
  if (!response.ok) return null;
  const body = (await response.json().catch(() => null)) as {
    id?: string;
    email?: string | null;
  } | null;
  if (!body?.id) return null;
  return { id: body.id, email: body.email ?? "", plan: "free", plan_expires_at: null };
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
