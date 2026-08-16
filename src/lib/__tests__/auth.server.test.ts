import { describe, expect, it } from "vitest";
import { hashToken, newId } from "../db.server";
import { sessionCookie } from "../auth.server";

describe("Vercel session helpers", () => {
  it("hashes the same token deterministically", () => {
    expect(hashToken("demo-token")).toBe(hashToken("demo-token"));
    expect(hashToken("demo-token")).not.toBe(hashToken("other-token"));
  });

  it("creates unique ids", () => {
    expect(newId()).not.toBe(newId());
  });

  it("creates an HttpOnly session cookie", () => {
    const cookie = sessionCookie("abc");
    expect(cookie).toContain("farmx_session=abc");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
  });
});
