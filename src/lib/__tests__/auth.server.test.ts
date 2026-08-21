import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authCookies,
  getSessionUser,
  requestPasswordRecovery,
  sessionCookie,
  signInWithSupabase,
  signUpWithSupabase,
} from "../auth.server";
import { hashToken, newId } from "../db.server";

describe("Supabase auth helpers", () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
    vi.restoreAllMocks();
  });

  it("hashes the same token deterministically", () => {
    expect(hashToken("demo-token")).toBe(hashToken("demo-token"));
    expect(hashToken("demo-token")).not.toBe(hashToken("other-token"));
  });

  it("creates unique ids", () => {
    expect(newId()).not.toBe(newId());
  });

  it("creates an HttpOnly compatibility cookie", () => {
    const cookie = sessionCookie("abc");
    expect(cookie).toContain("farmx_session=abc");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("calls Supabase password grant and returns the session", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          user: { id: "user-1", email: "user@example.com" },
        }),
        { status: 200 },
      ),
    );

    const result = await signInWithSupabase("user@example.com", "password123");
    expect(result.access_token).toBe("access-token");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/token?grant_type=password",
      expect.objectContaining({ method: "POST" }),
    );
    expect(authCookies("access-token", "refresh-token")).toHaveLength(2);
  });

  it("returns a confirmation-required signup response when Supabase has no session", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "user-2", email: "new@example.com" } }), {
        status: 200,
      }),
    );

    const result = await signUpWithSupabase(
      "new@example.com",
      "password123",
      "https://farmx-ai-one.vercel.app/auth",
    );
    expect(result.user?.id).toBe("user-2");
    expect(result.session).toBeUndefined();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/signup",
      expect.objectContaining({
        body: JSON.stringify({
          email: "new@example.com",
          password: "password123",
          options: { emailRedirectTo: "https://farmx-ai-one.vercel.app/auth" },
        }),
      }),
    );
  });

  it("requests a password recovery email with the FarmX auth redirect", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 200 }),
    );

    await requestPasswordRecovery("user@example.com", "https://farmx-ai-one.vercel.app/auth");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/recover",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "user@example.com",
          options: { redirectTo: "https://farmx-ai-one.vercel.app/auth" },
        }),
      }),
    );
  });

  it("resolves the current user from the Supabase access-token cookie", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "user-3", email: "current@example.com" }), { status: 200 }),
    );

    const user = await getSessionUser(
      new Request("https://farmx-ai-one.vercel.app/api/auth", {
        headers: { cookie: "farmx_access_token=access-token" },
      }),
    );
    expect(user).toMatchObject({ id: "user-3", email: "current@example.com", plan: "free" });
  });
});
