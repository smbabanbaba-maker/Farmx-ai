import { createFileRoute } from "@tanstack/react-router";
import { FARM_AI_SYSTEM_PROMPT } from "@/lib/farm-ai-prompt";
import { getAiKey, MISSING_KEY_MESSAGE } from "@/lib/ai-key.server";
import { createGeminiProvider, GEMINI_CHAT_MODEL } from "@/lib/gemini.server";
import { createManusProvider, MANUS_CHAT_MODEL } from "@/lib/manus.server";
import { streamText, type ModelMessage } from "ai";
import {
  consumeGuestQuota,
  consumeQuota,
  getViewer,
  GUEST_IMAGE_MESSAGE,
  SIGN_IN_REQUIRED,
} from "@/lib/entitlements.server";

type ContentPart =
  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string | ContentPart[];
};

type ChatRequestBody = {
  messages?: ChatMessage[];
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("messages required", { status: 400 });
        }

        const last = messages[messages.length - 1];
        const hasImage =
          Array.isArray(last?.content) && last.content.some((part) => part.type === "image_url");

        let viewer: Awaited<ReturnType<typeof getViewer>>;
        try {
          viewer = await getViewer(request);
          if (!viewer) {
            if (hasImage) return new Response(GUEST_IMAGE_MESSAGE, { status: 401 });
            const guestId = request.headers.get("x-guest-id")?.trim();
            if (!guestId) return new Response(SIGN_IN_REQUIRED, { status: 401 });
            try {
              const guestQuota = await consumeGuestQuota(guestId);
              if (!guestQuota.ok) return new Response(guestQuota.message, { status: 402 });
            } catch (quotaError) {
              // Keep guest chat available when the optional Neon quota store is not configured.
              // Authenticated requests still receive a clear JSON error below if their session store is unavailable.
              console.warn("Guest quota store unavailable; continuing without persistence", quotaError);
            }
          } else {
            const quota = await consumeQuota(viewer, hasImage ? "scans" : "messages");
            if (!quota.ok) return new Response(quota.message, { status: 402 });
          }
        } catch (error) {
          console.error("Viewer or quota check failed", error);
          return Response.json(
            { error: "Database is not configured. Connect Neon Postgres in Vercel, then redeploy." },
            { status: 503 },
          );
        }

        const geminiKey = getAiKey();
        const manus = createManusProvider();
        if (!manus && !geminiKey) {
          return new Response(MISSING_KEY_MESSAGE, { status: 500 });
        }

        try {
          const modelMessages: ModelMessage[] = messages.map((message) => {
            if (message.role === "assistant" || message.role === "system") {
              return {
                role: message.role,
                content:
                  typeof message.content === "string"
                    ? message.content
                    : message.content
                        .map((part) => (part.type === "text" ? part.text : ""))
                        .join("\n"),
              };
            }
            if (typeof message.content === "string") {
              return { role: "user", content: message.content };
            }
            return {
              role: "user",
              content: message.content.map((part) =>
                part.type === "text"
                  ? { type: "text" as const, text: part.text }
                  : { type: "image" as const, image: part.image_url.url },
              ),
            };
          });

          const model = manus
            ? manus(MANUS_CHAT_MODEL)
            : createGeminiProvider(geminiKey!)(GEMINI_CHAT_MODEL);
          const result = streamText({
            model,
            system: FARM_AI_SYSTEM_PROMPT,
            messages: modelMessages,
          });
          return result.toTextStreamResponse({
            headers: { "Cache-Control": "no-cache" },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "AI service unavailable.";
          console.error("AI provider error", error);
          const status = message.includes("429") ? 429 : message.includes("402") ? 402 : 502;
          return Response.json(
            {
              error:
                status === 429
                  ? "Too many requests. Please wait a moment and try again."
                  : status === 402
                    ? "AI credits are exhausted. Please add credits and try again."
                    : "FarmX AI could not answer right now. Please try again.",
            },
            { status },
          );
        }
      },
    },
  },
});
