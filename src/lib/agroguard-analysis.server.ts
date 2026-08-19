import { GEMINI_NATIVE_URL } from "@/lib/gemini.server";

export const MAX_CROP_IMAGE_BYTES = 10 * 1024 * 1024;
export const SUPPORTED_CROP = "Tomato";

export type AgroGuardResult = {
  crop: string;
  condition: string;
  confidence: number;
  severity: "None" | "Mild" | "Moderate" | "Severe" | "Unknown";
  observations: string[];
  recommendation: string;
  expert_required: boolean;
  uncertain: boolean;
};

const FALLBACK_RESULT: AgroGuardResult = {
  crop: SUPPORTED_CROP,
  condition: "Uncertain",
  confidence: 0,
  severity: "Unknown",
  observations: ["The AI could not confidently interpret this image."],
  recommendation:
    "Please take a clearer, well-lit photo of the tomato leaf and consult an agricultural expert if symptoms are spreading.",
  expert_required: true,
  uncertain: true,
};

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  return key;
}

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const candidate = fenced ?? text.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) throw new Error("Gemini returned no structured analysis.");
  return JSON.parse(candidate) as Partial<AgroGuardResult>;
}

function normalizeResult(value: Partial<AgroGuardResult>): AgroGuardResult {
  const confidence = Math.max(0, Math.min(100, Math.round(Number(value.confidence) || 0)));
  const severity = ["None", "Mild", "Moderate", "Severe", "Unknown"].includes(
    String(value.severity),
  )
    ? (value.severity as AgroGuardResult["severity"])
    : "Unknown";
  return {
    crop: String(value.crop || SUPPORTED_CROP),
    condition: String(value.condition || "Uncertain"),
    confidence,
    severity,
    observations: Array.isArray(value.observations)
      ? value.observations.map(String).slice(0, 6)
      : FALLBACK_RESULT.observations,
    recommendation: String(value.recommendation || FALLBACK_RESULT.recommendation),
    expert_required: Boolean(value.expert_required) || confidence < 80,
    uncertain: Boolean(value.uncertain) || confidence < 60,
  };
}

export async function analyzeTomatoImage(input: { mimeType: string; base64: string }) {
  const response = await fetch(
    `${GEMINI_NATIVE_URL}/models/${process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash"}:generateContent?key=${encodeURIComponent(getApiKey())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are AgroGuard, a careful agricultural vision assistant. Analyze this image as a preliminary tomato crop-health assessment. Return ONLY valid JSON matching this exact shape: {"crop":"Tomato","condition":"Possible ...","confidence":0,"severity":"None|Mild|Moderate|Severe|Unknown","observations":["..."],"recommendation":"...","expert_required":true,"uncertain":false}. Never claim certainty, never invent symptoms that are not visible, and use confidence below 60 when the leaf is blurry, not a tomato leaf, or the condition is unclear. If it is not a clear tomato crop image, say so in condition and recommendation. Include practical, non-prescriptive guidance and advise an agricultural expert for severe, fast-spreading, or uncertain symptoms.`,
              },
              { inline_data: { mime_type: input.mimeType, data: input.base64 } },
            ],
          },
        ],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini vision request failed (${response.status}): ${body}`);
  }
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  try {
    return normalizeResult(extractJson(text));
  } catch {
    return FALLBACK_RESULT;
  }
}
