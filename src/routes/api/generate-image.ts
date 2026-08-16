import { createFileRoute } from "@tanstack/react-router";
import { getAiKey, MISSING_KEY_MESSAGE } from "@/lib/ai-key.server";
import { GEMINI_NATIVE_URL, GEMINI_IMAGE_MODEL } from "@/lib/gemini.server";
import { generateFarmImage } from "@/lib/image-generation.server";
type GeminiPart = { inlineData?: { mimeType?: string; data?: string } };

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt || !prompt.trim()) {
          return new Response("prompt required", { status: 400 });
        }

        const farmPrompt = `Create a clear, useful agriculture visual for FarmX AI. ${prompt.trim()}. Avoid unsafe pesticide instructions, fake labels, and unreadable text.`;
        if (process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY) {
          try {
            const url = await generateFarmImage(farmPrompt);
            return Response.json({ url, provider: "manus" });
          } catch (error) {
            console.warn("Manus image generation failed; trying Gemini fallback", error);
          }
        }

        const key = getAiKey();
        if (!key) return new Response(MISSING_KEY_MESSAGE, { status: 500 });

        const upstream = await fetch(
          `${GEMINI_NATIVE_URL}/models/${GEMINI_IMAGE_MODEL}:generateContent`,
          {
            method: "POST",
            headers: {
              "x-goog-api-key": key,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: farmPrompt }],
                },
              ],
            }),
          },
        );

        if (!upstream.ok) {
          const body = await upstream.text().catch(() => "");
          console.error("Image generation failed", upstream.status, body);
          return new Response(
            upstream.status === 429
              ? "Too many requests. Please wait a moment."
              : "Could not generate that image right now.",
            { status: upstream.status },
          );
        }

        const data = (await upstream.json()) as {
          candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
        };
        const inline = data.candidates?.[0]?.content?.parts?.find(
          (part) => part.inlineData?.data,
        )?.inlineData;
        if (!inline?.data) return new Response("No image returned.", { status: 502 });
        return Response.json({
          url: `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`,
          provider: "gemini",
        });
      },
    },
  },
});
