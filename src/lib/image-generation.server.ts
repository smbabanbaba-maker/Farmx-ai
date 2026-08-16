const DEFAULT_MODEL = "MODEL_GPT_IMAGE_2";
const DEFAULT_QUALITY = "medium";

export async function generateFarmImage(prompt: string) {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Image generation is not configured on this deployment.");
  }

  const baseUrl = forgeApiUrl.endsWith("/") ? forgeApiUrl : `${forgeApiUrl}/`;
  const endpoint = new URL("images.v1.ImageService/GenerateImage", baseUrl).toString();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${forgeApiKey}`,
    },
    body: JSON.stringify({
      prompt,
      original_images: [],
      model: DEFAULT_MODEL,
      quality: DEFAULT_QUALITY,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image generation failed (${response.status})${detail ? `: ${detail}` : ""}`);
  }

  const result = (await response.json()) as {
    image?: { b64Json?: string; mimeType?: string };
  };
  const base64 = result.image?.b64Json;
  const mimeType = result.image?.mimeType ?? "image/png";
  if (!base64) throw new Error("Image service returned no image.");

  return `data:${mimeType};base64,${base64}`;
}
