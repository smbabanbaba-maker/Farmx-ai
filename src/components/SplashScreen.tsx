import { useEffect, useState } from "react";
import { FarmAiLogo } from "@/components/FarmAiLogo";

/** Two-second branded launch screen shown once per app open. */
export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("farmx.splash-shown")) {
      setVisible(false);
      return;
    }
    window.sessionStorage.setItem("farmx.splash-shown", "1");
    const fade = window.setTimeout(() => setFading(true), 1700);
    const hide = window.setTimeout(() => setVisible(false), 2100);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400"
      style={{ background: "var(--background)", opacity: fading ? 0 : 1 }}
    >
      <div className="flex flex-col items-center animate-fade-in">
        <FarmAiLogo size={96} />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">FarmX AI</h1>
      </div>
      <p className="absolute bottom-10 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        from SYLUTION
      </p>
    </div>
  );
}
