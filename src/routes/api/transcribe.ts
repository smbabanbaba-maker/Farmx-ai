import { createFileRoute } from "@tanstack/react-router";
import { getAiKey, MISSING_KEY_MESSAGE } from "@/lib/ai-key.server";
import { GEMINI_NATIVE_URL, GEMINI_CHAT_MODEL } from "@/lib/gemini.server";
import { getViewer, SIGN_IN_REQUIRED } from "@/lib/entitlements.server";
import { PLAN_LIMITS } from "@/lib/plans";

const MAX_BYTES = 20 * 1024 * 1024;

function toBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const viewer = await getViewer(request);
        if (!viewer) return new Response(SIGN_IN_REQUIRED, { status: 401 });
        if (!PLAN_LIMITS[viewer.plan].voice) {
          return new Response(
            "Voice AI na shirin GO da PRO ne. / Voice AI is available on the GO and PRO plans.",
            { status: 402 },
          );
        }

        const key = getAiKey();
        if (!key) return new Response(MISSING_KEY_MESSAGE, { status: 500 });

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Expected multipart/form-data", { status: 400 });
        }

        const audio = form.get("audio");
        if (!(audio instanceof File) || audio.size === 0) {
          return new Response("Audio file is required", { status: 400 });
        }
        if (audio.size > MAX_BYTES) {
          return new Response("Recording is too large", { status: 413 });
        }

        const base64 = toBase64(new Uint8Array(await audio.arrayBuffer()));

        const resp = await fetch(
          `${GEMINI_NATIVE_URL}/models/${GEMINI_CHAT_MODEL}:generateContent`,
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
                  parts: [
                    {
                      text: "Transcribe this audio verbatim in its original language. Return only the transcript text, no commentary.",
                    },
                    {
                      inlineData: {
                        mimeType: audio.type || "audio/webm",
                        data: base64,
                      },
                    },
                  ],
                },
              ],
            }),
          },
        );

        if (!resp.ok) {
          const body = await resp.text().catch(() => "");
          console.error("Transcription failed", resp.status, body);
          return new Response(
            resp.status === 429
              ? "Too many voice requests. Please wait a moment."
              : "Could not transcribe that recording.",
            { status: resp.status },
          );
        }

        const data = (await resp.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = (data.candidates?.[0]?.content?.parts ?? [])
          .map((part) => part.text ?? "")
          .join("")
          .trim();
        return Response.json({ text });
      },
    },
  },
});
