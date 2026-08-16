import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const BUILT_IN_FORGE_API_URL = process.env["BUILT_IN_FORGE_API_URL"];
const BUILT_IN_FORGE_API_KEY = process.env["BUILT_IN_FORGE_API_KEY"];

export const MANUS_CHAT_MODEL = process.env["MANUS_CHAT_MODEL"] || "gpt-5-mini";

export function hasManusProvider() {
  return Boolean(BUILT_IN_FORGE_API_URL && BUILT_IN_FORGE_API_KEY);
}

export function createManusProvider() {
  if (!hasManusProvider()) return null;

  return createOpenAICompatible({
    name: "manus",
    baseURL: `${BUILT_IN_FORGE_API_URL!.replace(/\/$/, "")}/v1`,
    apiKey: BUILT_IN_FORGE_API_KEY!,
  });
}
