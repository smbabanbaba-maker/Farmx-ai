import { createFileRoute } from "@tanstack/react-router";
import { getAiKey, MISSING_KEY_MESSAGE } from "@/lib/ai-key.server";
import { GEMINI_NATIVE_URL, GEMINI_IMAGE_MODEL } from "@/lib/gemini.server";
import {
  generateFarmImage,
  generateGeminiFarmImage,
  persistGeneratedImage,
} from "@/lib/image-generation.server";

type GeminiPart = { inlineData?: { mimeType?: string; data?: string } };

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt || !prompt.trim()) return new Response("prompt required", { status: 400 });
        if (prompt.trim().length > 1200) {
          return new Response("Please keep the prompt under 1200 characters.", { status: 400 });
        }

        const farmPrompt = `Create a clear, useful agriculture visual for FarmX AI. ${prompt.trim()}. Avoid unsafe pesticide instructions, fake labels, and unreadable text.`;

        if (process.env.BUILT_IN_FORGE_API_URL && process.env.BUILT_IN_FORGE_API_KEY) {
          try {
            const dataUrl = await generateFarmImage(farmPrompt);
            const url = await persistGeneratedImage(request, dataUrl).catch(() => dataUrl);
            return Response.json({ url, provider: "manus" });
          } catch (error) {
            console.warn("Manus image generation failed; trying Gemini", error);
          }
        }

        try {
          const dataUrl = await generateGeminiFarmImage(farmPrompt);
          const url = await persistGeneratedImage(request, dataUrl).catch(() => dataUrl);
          return Response.json({ url, provider: "gemini-interactions" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Gemini image generation failed.";
          if (message.startsWith("RATE_LIMITED:")) {
            return new Response(
              "Gemini image quota is temporarily exhausted. Wait a little and try again, or add billing/another image key in Vercel.",
              { status: 429 },
            );
          }
          console.warn(
            "Gemini Interactions image generation failed; trying legacy endpoint",
            error,
          );
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
              contents: [{ role: "user", parts: [{ text: farmPrompt }] }],
            }),
          },
        );

        if (!upstream.ok) {
          const body = await upstream.text().catch(() => "");
          console.error("Legacy Gemini image generation failed", upstream.status, body);
          return new Response(
            upstream.status === 429
              ? "Gemini image quota is temporarily exhausted. Wait a little and try again."
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
        const dataUrl = `data:${inline.mimeType ?? "image/png"};base64,${inline.data}`;
        const url = await persistGeneratedImage(request, dataUrl).catch(() => dataUrl);
        return Response.json({ url, provider: "gemini-legacy" });
      },
    },
  },
});
