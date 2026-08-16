import { Loader2, Mic, RotateCcw, Square, X } from "lucide-react";
import type { VoiceState } from "@/lib/voice";

export function VoiceSheet({
  open,
  state,
  liveText,
  level,
  error,
  seconds,
  onStop,
  onCancel,
  onRetry,
  continuous,
}: {
  open: boolean;
  state: VoiceState;
  liveText: string;
  level: number;
  error: string | null;
  seconds: number;
  onStop: () => void;
  onCancel: () => void;
  onRetry: () => void;
  continuous?: boolean;
}) {
  if (!open) return null;
  const recording = state === "recording";
  const bars = [0, 1, 2, 3, 4];
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close voice input"
        onClick={onCancel}
        className="absolute inset-0"
        style={{
          background: "color-mix(in oklab, var(--background) 70%, transparent)",
          backdropFilter: "blur(6px)",
        }}
      />
      <div className="glass-card relative z-10 w-full max-w-2xl rounded-t-3xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {state === "requesting" && "Starting microphone…"}
            {recording && `${continuous ? "Continuous listening" : "Listening"} · ${mmss}`}
            {state === "transcribing" && "Transcribing…"}
            {state === "error" && "Voice input failed"}
          </span>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5"
            style={{ background: "var(--surface-2)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 flex h-16 items-center justify-center gap-1.5">
          {bars.map((i) => {
            const h = recording
              ? Math.max(8, Math.min(56, level * 900 * (1 + (i % 3) * 0.5) + 8))
              : 8;
            return (
              <span
                key={i}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: h,
                  background: "var(--foreground)",
                  opacity: recording ? 0.9 : 0.3,
                }}
              />
            );
          })}
        </div>

        <div
          className="min-h-14 rounded-2xl px-4 py-3 text-sm"
          style={{ background: "var(--surface-2)" }}
        >
          {error ? (
            <span className="text-destructive-foreground">{error}</span>
          ) : liveText ? (
            <span className="break-words">{liveText}</span>
          ) : (
            <span className="text-muted-foreground">
              {recording
                ? continuous
                  ? "Speak naturally — each sentence is sent when you pause. The mic stays open."
                  : "Speak now — your words appear here live."
                : "Preparing…"}
            </span>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          {state === "error" ? (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
            >
              <RotateCcw size={16} /> Try again
            </button>
          ) : state === "transcribing" ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 size={16} className="animate-spin" /> Finishing up…
            </span>
          ) : (
            <button
              onClick={onStop}
              disabled={!recording}
              className="flex h-14 w-14 items-center justify-center rounded-full disabled:opacity-40"
              style={{ background: "var(--foreground)", color: "var(--background)" }}
              title={continuous ? "Send and close" : "Stop and send"}
            >
              {recording ? <Square size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
