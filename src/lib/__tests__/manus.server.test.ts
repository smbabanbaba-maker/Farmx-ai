import { describe, expect, it } from "vitest";
import { MANUS_CHAT_MODEL, hasManusProvider } from "../manus.server";

describe("Manus AI provider configuration", () => {
  it("uses a configurable model with a safe default", () => {
    expect(MANUS_CHAT_MODEL.length).toBeGreaterThan(0);
  });

  it("reports whether the server-side Manus credentials are available", () => {
    expect(typeof hasManusProvider()).toBe("boolean");
  });
});
