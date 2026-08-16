// FarmX AI — user preferences (readability + voice), persisted in localStorage
import { useCallback, useEffect, useState } from "react";

export type Preferences = {
  /** Chat text scale multiplier (0.85 – 1.4) */
  textScale: number;
  /** Line-height / spacing multiplier (0.9 – 1.5) */
  spacing: number;
  /** Keep listening after each sentence */
  continuousVoice: boolean;
  /** Automatic retries when transcription fails (0 – 5) */
  voiceRetries: number;
};

export const DEFAULT_PREFERENCES: Preferences = {
  textScale: 1,
  spacing: 1,
  continuousVoice: true,
  voiceRetries: 2,
};

const KEY = "farmx-ai:preferences";
const EVENT = "farmx-ai:preferences-changed";

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function applyPreferences(prefs: Preferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--chat-text-scale", String(prefs.textScale));
  root.style.setProperty("--chat-spacing", String(prefs.spacing));
}

export function writePreferences(prefs: Preferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(prefs));
  applyPreferences(prefs);
  window.dispatchEvent(new CustomEvent<Preferences>(EVENT, { detail: prefs }));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loaded = readPreferences();
    setPrefs(loaded);
    applyPreferences(loaded);
    const onChange = (e: Event) => setPrefs((e as CustomEvent<Preferences>).detail);
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...patch };
      writePreferences(next);
      return next;
    });
  }, []);

  return { prefs, update };
}
