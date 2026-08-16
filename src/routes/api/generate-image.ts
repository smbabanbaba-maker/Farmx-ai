import { createFileRoute } from "@tanstack/react-router";
import { getAiKey, MISSING_KEY_MESSAGE } from "@/lib/ai-key.server";
import { GEMINI_NATIVE_URL, GEMINI_IMAGE_MODEL } from "@/lib/gemini.server";
import { consumeQuota, getViewer, SIGN_IN_REQUIRED } from "@/lib/entitlements.server";
import { PLAN_LIMITS } from "@/lib/plans";

type GeminiPart = { inlineData?: { mimeType?: string; data?: string } };

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt?: string };
        if (!prompt || !prompt.trim()) {
          return new Response("prompt required", { status: 400 });
        }

        const viewer = await getViewer(request);
        if (!viewer) return new Response(SIGN_IN_REQUIRED, { status: 401 });

        if (PLAN_LIMITS[viewer.plan].imagesPerDay === 0) {
          return new Response(
            "Ƙirƙirar hoto na shirin GO da PRO ne. / AI image generation is available on the GO and PRO plans.",
            { status: 402 },
          );
        }

        const quota = await consumeQuota(viewer, "messages");
        if (!quota.ok) return new Response(quota.message, { status: 402 });

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
                  parts: [{ text: `Agriculture / farming illustration. ${prompt}` }],
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
        });
      },
    },
  },
});
