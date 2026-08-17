const ACCESS_COOKIE = "farmx_access_token";

function config() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase data API is not configured.");
  return { url: url.replace(/\/$/, ""), publishableKey };
}

export function accessTokenFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.match(new RegExp(`(?:^|; )${ACCESS_COOKIE}=([^;]+)`))?.[1] ?? null;
}

export async function supabaseDataRequest<T = unknown>(
  request: Request,
  path: string,
  init: RequestInit = {},
) {
  const { url, publishableKey } = config();
  const token = accessTokenFromRequest(request);
  if (!token) throw new Error("Supabase session is required for data access.");
  const headers = new Headers(init.headers);
  headers.set("apikey", publishableKey);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase data request failed (${response.status}): ${body}`);
  return body ? (JSON.parse(body) as T) : (undefined as T);
}

export async function supabaseRpc<T = unknown>(
  request: Request,
  functionName: string,
  body: Record<string, unknown>,
) {
  return supabaseDataRequest<T>(request, `rpc/${functionName}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function adminConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase server admin access is not configured.");
  }
  return { url: url.replace(/\/$/, ""), serviceKey };
}

/** Server-only request for trusted webhook/payment writes. Never expose this key to the browser. */
export async function supabaseAdminRequest<T = unknown>(path: string, init: RequestInit = {}) {
  const { url, serviceKey } = adminConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceKey);
  headers.set("Authorization", `Bearer ${serviceKey}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  const body = await response.text();
  if (!response.ok) throw new Error(`Supabase admin request failed (${response.status}): ${body}`);
  return body ? (JSON.parse(body) as T) : (undefined as T);
}
