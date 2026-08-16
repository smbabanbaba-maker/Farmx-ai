// FarmX AI — voice capture + live transcription helpers
import { authHeaders } from "@/hooks/use-entitlement";

export type VoiceState = "idle" | "requesting" | "recording" | "transcribing" | "error";

const TARGET_RATE = 16000;

function downsample(buffer: Float32Array, from: number, to: number): Float32Array {
  if (to >= from) return buffer;
  const ratio = from / to;
  const length = Math.floor(buffer.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), buffer.length);
    let sum = 0;
    for (let j = start; j < end; j++) sum += buffer[j];
    out[i] = sum / Math.max(1, end - start);
  }
  return out;
}

export function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
  let total = 0;
  for (const c of chunks) total += c.length;
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }
  const samples = downsample(merged, sampleRate, TARGET_RATE);
  const rate = sampleRate > TARGET_RATE ? TARGET_RATE : sampleRate;

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let pos = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function rms(chunks: Float32Array[]): number {
  const last = chunks[chunks.length - 1];
  if (!last || last.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < last.length; i++) sum += last[i] * last[i];
  return Math.sqrt(sum / last.length);
}

/** Transcribe a WAV blob with automatic retries (exponential backoff). */
export async function transcribeBlob(
  blob: Blob,
  { retries = 2, signal }: { retries?: number; signal?: AbortSignal } = {},
): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.wav");
      const resp = await fetch("/api/transcribe", {
        method: "POST",
        headers: await authHeaders(),
        body: form,
        signal,
      });
      if (!resp.ok) {
        const msg = (await resp.text().catch(() => "")) || `Error ${resp.status}`;
        // Client errors other than rate limits won't succeed on retry.
        if (resp.status !== 429 && resp.status >= 400 && resp.status < 500) {
          throw Object.assign(new Error(msg), { fatal: true });
        }
        throw new Error(msg);
      }
      const data = (await resp.json()) as { text?: string };
      return (data.text ?? "").trim();
    } catch (err) {
      const e = err as Error & { fatal?: boolean };
      if (e.name === "AbortError" || e.fatal) throw e;
      lastError = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      }
    }
  }
  throw lastError ?? new Error("Transcription failed");
}
