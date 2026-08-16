import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Official Google Gemini API (OpenAI-compatible endpoint). */
export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
export const GEMINI_NATIVE_URL = "https://generativelanguage.googleapis.com/v1beta";

export const GEMINI_CHAT_MODEL = "gemini-3.6-flash";
export const GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";

export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "google",
    baseURL: GEMINI_BASE_URL,
    apiKey,
  });
}
