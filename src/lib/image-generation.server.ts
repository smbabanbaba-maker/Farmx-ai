const DEFAULT_MANUS_MODEL = "MODEL_GPT_IMAGE_2";
const DEFAULT_MANUS_QUALITY = "medium";
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";
const STORAGE_BUCKET = "farmx-images";

export async function generateFarmImage(prompt: string) {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;
  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Manus ImageService is not configured on this deployment.");
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
      model: DEFAULT_MANUS_MODEL,
      quality: DEFAULT_MANUS_QUALITY,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Manus image generation failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const result = (await response.json()) as {
    image?: { b64Json?: string; mimeType?: string };
  };
  const base64 = result.image?.b64Json;
  const mimeType = result.image?.mimeType ?? "image/png";
  if (!base64) throw new Error("Manus ImageService returned no image.");
  return `data:${mimeType};base64,${base64}`;
}

export async function persistGeneratedImage(request: Request, dataUrl: string) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !storageKey) return dataUrl;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return dataUrl;
  const [, mimeType, encoded] = match;
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
  const objectPath = `generated/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${storageKey}`,
        apikey: storageKey,
        "Content-Type": mimeType,
        "x-upsert": "false",
      },
      body: Buffer.from(encoded, "base64"),
    },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase image storage failed (${response.status})${detail ? `: ${detail}` : ""}`,
    );
  }
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath}`;
}

export async function generateGeminiFarmImage(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.GEMINI_IMAGE_MODEL ?? DEFAULT_GEMINI_IMAGE_MODEL,
      input: [{ type: "text", text: prompt }],
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    output_image?: { data?: string; mime_type?: string; mimeType?: string };
    error?: { message?: string };
  };
  if (!response.ok) {
    const detail = payload.error?.message ?? `Gemini image generation failed (${response.status})`;
    throw new Error(`${response.status === 429 ? "RATE_LIMITED: " : ""}${detail}`);
  }

  const image = payload.output_image;
  if (!image?.data) throw new Error("Gemini returned no image.");
  return `data:${image.mime_type ?? image.mimeType ?? "image/png"};base64,${image.data}`;
}
