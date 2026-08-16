/**
 * Resolves the optional Google Gemini API key used as a fallback provider.
 * Manus built-in credentials are checked separately by manus.server.ts.
 */
export function getAiKey(): string | undefined {
  return process.env["GEMINI_API_KEY"];
}

export const MISSING_KEY_MESSAGE =
  "AI ba a kunna ba a wannan hosting ɗin. Sanya BUILT_IN_FORGE_API_URL da BUILT_IN_FORGE_API_KEY don Manus AI, ko GEMINI_API_KEY a matsayin fallback, sannan ka sake deploy. / Configure the Manus built-in API variables or GEMINI_API_KEY and redeploy.";
