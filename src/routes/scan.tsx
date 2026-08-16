import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Upload, Leaf, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { createThread, saveThread } from "@/lib/chat-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Plant Scanner — FarmX AI" },
      {
        name: "description",
        content:
          "Snap a photo of any crop and FarmX AI identifies the plant, diagnoses disease/pest/deficiency, and recommends treatment.",
      },
      { property: "og:title", content: "Plant Scanner — FarmX AI" },
      { property: "og:description", content: "AI plant disease diagnosis with treatment plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      const prompt =
        "Analyze this plant photo. Identify:\n- Plant name\n- Disease / pest / nutrient deficiency (if any)\n- Confidence score\n- Chemical treatment (with active ingredient)\n- Recommended pesticide / fertilizer\n- Organic treatment\n- Prevention tips";
      const id = createThread();
      saveThread(id, [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: preview } },
          ],
        },
      ]);
      navigate({ to: "/", search: { c: id } as never });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-5 pt-4 pb-16">
        <div className="flex items-center gap-3">
          <FarmAiLogo size={40} />
          <div>
            <h1 className="text-lg font-semibold">Plant Scanner</h1>
            <p className="text-xs text-muted-foreground">
              AI diagnosis for diseases, pests & deficiencies
            </p>
          </div>
        </div>

        <div
          className="glass-card mt-6 flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-muted-foreground">
              <Leaf size={44} style={{ color: "var(--primary)" }} />
              <p className="text-sm">Add a clear, close-up photo of the plant leaf or stem.</p>
            </div>
          )}
        </div>

        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => camRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium"
            style={{ background: "var(--surface)" }}
          >
            <Camera size={18} /> Take Photo
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium"
            style={{ background: "var(--surface)" }}
          >
            <Upload size={18} /> Upload
          </button>
        </div>

        <button
          disabled={!preview || busy}
          onClick={analyze}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Leaf size={16} />}
          Diagnose with FarmX AI
        </button>

        <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
          <li>• Plant name, disease, pest, nutrient deficiency</li>
          <li>• Confidence score & treatment (chemical + organic)</li>
          <li>• Recommended pesticide & fertilizer</li>
          <li>• Prevention tips</li>
        </ul>
      </div>
    </AppShell>
  );
}
