import { useCallback, useEffect, useRef, useState } from "react";
import { encodeWav, rms, transcribeBlob, type VoiceState } from "@/lib/voice";
import { readPreferences } from "@/lib/preferences";

const LIVE_INTERVAL_MS = 2600;
const SILENCE_LEVEL = 0.012;
const SILENCE_MS = 1500;
const MIN_SEGMENT_MS = 900;

export function useVoiceRecorder({ onFinal }: { onFinal: (text: string) => void }) {
  const [state, setState] = useState<VoiceState>("idle");
  const [liveText, setLiveText] = useState("");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [continuous, setContinuous] = useState(true);

  const chunksRef = useRef<Float32Array[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const liveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlight = useRef(false);
  const cancelled = useRef(false);
  const continuousRef = useRef(true);
  const retriesRef = useRef(2);
  const speechSeen = useRef(false);
  const silenceSince = useRef<number | null>(null);
  const segmentStart = useRef(0);
  const finalizing = useRef(false);

  const stopAudio = useCallback(() => {
    if (liveTimer.current) clearInterval(liveTimer.current);
    if (tick.current) clearInterval(tick.current);
    liveTimer.current = null;
    tick.current = null;
    if (nodeRef.current) nodeRef.current.onaudioprocess = null;
    nodeRef.current?.disconnect();
    srcRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => {});
    nodeRef.current = null;
    srcRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
    setLevel(0);
  }, []);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const resetSegment = () => {
    chunksRef.current = [];
    speechSeen.current = false;
    silenceSince.current = null;
    segmentStart.current = Date.now();
  };

  /** Transcribe the current buffer. In continuous mode recording keeps running. */
  const flushSegment = useCallback(
    async (keepListening: boolean) => {
      if (finalizing.current) return;
      finalizing.current = true;
      const sampleRate = ctxRef.current?.sampleRate ?? 44100;
      const chunks = chunksRef.current;
      resetSegment();

      const hasAudio = chunks.length > 0;
      const blob = hasAudio ? encodeWav(chunks, sampleRate) : null;

      if (!keepListening) stopAudio();

      if (!blob || blob.size < 3000) {
        finalizing.current = false;
        if (!keepListening) {
          setState("idle");
          setLiveText("");
        }
        return;
      }

      if (!keepListening) setState("transcribing");
      try {
        const text = await transcribeBlob(blob, { retries: retriesRef.current });
        if (cancelled.current) return;
        if (text) {
          setLiveText("");
          onFinal(text);
          if (keepListening) setState("recording");
          else setState("idle");
        } else if (!keepListening) {
          setState("error");
          setError("We couldn't hear anything. Try recording again.");
        }
      } catch (err) {
        if (cancelled.current) return;
        const message = (err as Error).message || "Voice input failed. Please try again.";
        if (keepListening) {
          setError(message);
          setState("recording");
        } else {
          stopAudio();
          setState("error");
          setError(message);
        }
      } finally {
        finalizing.current = false;
      }
    },
    [onFinal, stopAudio],
  );

  const start = useCallback(async () => {
    const prefs = readPreferences();
    continuousRef.current = prefs.continuousVoice;
    retriesRef.current = prefs.voiceRetries;
    setContinuous(prefs.continuousVoice);

    setError(null);
    setLiveText("");
    setSeconds(0);
    cancelled.current = false;
    finalizing.current = false;
    resetSegment();
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      srcRef.current = source;
      const node = ctx.createScriptProcessor(4096, 1, 1);
      nodeRef.current = node;
      node.onaudioprocess = (e) => {
        chunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        const lvl = rms(chunksRef.current);
        setLevel(lvl);

        if (!continuousRef.current) return;
        const now = Date.now();
        if (lvl > SILENCE_LEVEL) {
          speechSeen.current = true;
          silenceSince.current = null;
          return;
        }
        if (!speechSeen.current) return;
        if (silenceSince.current === null) silenceSince.current = now;
        else if (
          now - silenceSince.current > SILENCE_MS &&
          now - segmentStart.current > MIN_SEGMENT_MS &&
          !finalizing.current
        ) {
          void flushSegment(true);
        }
      };
      source.connect(node);
      node.connect(ctx.destination);
      setState("recording");
      segmentStart.current = Date.now();

      tick.current = setInterval(() => setSeconds((s) => s + 1), 1000);

      // Live (partial) captions for the current segment.
      liveTimer.current = setInterval(() => {
        if (inFlight.current || finalizing.current || chunksRef.current.length === 0) return;
        const blob = encodeWav(chunksRef.current, ctx.sampleRate);
        if (blob.size < 4096) return;
        inFlight.current = true;
        transcribeBlob(blob, { retries: 1 })
          .then((text) => {
            if (!cancelled.current && text && !finalizing.current) setLiveText(text);
          })
          .catch(() => {
            /* partials are best-effort */
          })
          .finally(() => {
            inFlight.current = false;
          });
      }, LIVE_INTERVAL_MS);
    } catch {
      stopAudio();
      setState("error");
      setError("Microphone access is needed to use voice input.");
    }
  }, [flushSegment, stopAudio]);

  const finish = useCallback(() => flushSegment(false), [flushSegment]);

  const cancel = useCallback(() => {
    cancelled.current = true;
    stopAudio();
    setState("idle");
    setLiveText("");
    setError(null);
  }, [stopAudio]);

  return {
    state,
    liveText,
    level,
    error,
    seconds,
    continuous,
    start,
    finish,
    cancel,
    retry: start,
  };
}
