import { createFileRoute } from "@tanstack/react-router";
import { analyzeTomatoImage, MAX_CROP_IMAGE_BYTES } from "@/lib/agroguard-analysis.server";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/agroguard/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const form = await request.formData();
          const file = form.get("image");
          if (!(file instanceof File)) {
            return Response.json({ error: "Please upload a crop image." }, { status: 400 });
          }
          if (!ALLOWED_TYPES.has(file.type)) {
            return Response.json({ error: "Use a JPG, PNG, or WebP crop image." }, { status: 415 });
          }
          if (file.size > MAX_CROP_IMAGE_BYTES) {
            return Response.json(
              { error: "Image is too large. Maximum size is 10 MB." },
              { status: 413 },
            );
          }
          const bytes = new Uint8Array(await file.arrayBuffer());
          const base64 = Buffer.from(bytes).toString("base64");
          const result = await analyzeTomatoImage({ mimeType: file.type, base64 });
          return Response.json({ result });
        } catch (error) {
          console.error("AgroGuard analysis failed", error);
          const message = error instanceof Error ? error.message : "Analysis failed.";
          return Response.json(
            {
              error: message.includes("GEMINI_API_KEY")
                ? "Gemini vision is not configured on the server. Add GEMINI_API_KEY in Vercel."
                : "We could not complete the crop analysis. Please try again with a clearer image.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
