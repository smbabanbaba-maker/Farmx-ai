import { afterEach, describe, expect, it, vi } from "vitest";
import { generateFarmImage } from "@/lib/image-generation.server";

describe("generateFarmImage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls Manus ImageService and returns a data URL", async () => {
    vi.stubEnv("BUILT_IN_FORGE_API_URL", "https://forge.example/");
    vi.stubEnv("BUILT_IN_FORGE_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ image: { b64Json: "aGVsbG8=", mimeType: "image/png" } }), {
          status: 200,
        }),
      ),
    );

    await expect(generateFarmImage("A maize field plan")).resolves.toBe(
      "data:image/png;base64,aGVsbG8=",
    );
    expect(fetch).toHaveBeenCalledWith(
      "https://forge.example/images.v1.ImageService/GenerateImage",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
