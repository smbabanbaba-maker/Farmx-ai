import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeTomatoImage } from "@/lib/agroguard-analysis.server";

describe("AgroGuard tomato analysis", () => {
  afterEach(() => vi.restoreAllMocks());

  it("normalizes a structured Gemini vision response and flags low confidence", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        crop: "Tomato",
                        condition: "Possible Early Blight",
                        confidence: 55,
                        severity: "Moderate",
                        observations: ["Dark lesions visible"],
                        recommendation: "Retake a clearer image and consult an expert.",
                        expert_required: false,
                        uncertain: false,
                      }),
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = await analyzeTomatoImage({ mimeType: "image/jpeg", base64: "dGVzdA==" });
    expect(result.condition).toBe("Possible Early Blight");
    expect(result.confidence).toBe(55);
    expect(result.uncertain).toBe(true);
    expect(result.expert_required).toBe(true);
  });
});
