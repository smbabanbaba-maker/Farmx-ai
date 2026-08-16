import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InfoPage, Row, Section } from "@/components/InfoPage";
import { usePreferences } from "@/lib/preferences";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FarmX AI" },
      {
        name: "description",
        content:
          "Manage your FarmX AI profile, language, notifications, permissions and subscription.",
      },
      { property: "og:title", content: "FarmX AI Settings" },
      { property: "og:description", content: "Manage your FarmX AI profile and preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function useLocal(key: string, initial: string) {
  const [value, setValue] = useState<string>(initial);
  useEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (v) setValue(v);
  }, [key]);
  const update = (v: string) => {
    setValue(v);
    if (typeof window !== "undefined") localStorage.setItem(key, v);
  };
  return [value, update] as const;
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-6 w-10 rounded-full transition-colors"
      style={{ background: on ? "var(--primary)" : "var(--surface)" }}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? "1.25rem" : "0.125rem" }}
      />
    </button>
  );
}

function SettingsPage() {
  const [name, setName] = useLocal("farmx-ai:profile:name", "Farmer");
  const [language, setLanguage] = useLocal("farmx-ai:lang", "English");
  const [notif, setNotif] = useState(true);
  const [voice, setVoice] = useState(true);
  const [cam, setCam] = useState(true);
  const [loc, setLoc] = useState(true);
  const { prefs, update } = usePreferences();

  return (
    <InfoPage title="Settings" subtitle="Personalize your FarmX AI experience.">
      <Section title="Profile">
        <Row
          label="Display name"
          hint="Shown inside the app"
          action={
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-40 rounded-lg bg-background px-2 py-1 text-right text-sm outline-none"
            />
          }
        />
        <Row
          label="Farmer profile"
          hint="Farm name, location, size and crops"
          action={
            <a href="/profile" className="text-xs font-semibold underline">
              Open
            </a>
          }
        />
      </Section>

      <Section title="Preferences">
        <Row
          label="Language"
          action={
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg bg-background px-2 py-1 text-sm outline-none"
            >
              <option>English</option>
              <option>Hausa</option>
              <option>French</option>
              <option>Arabic</option>
            </select>
          }
        />
        <Row
          label="Dark mode"
          hint="Always on for premium clarity"
          action={<Toggle on onChange={() => {}} />}
        />
        <Row label="Notifications" action={<Toggle on={notif} onChange={setNotif} />} />
        <Row label="Voice input" action={<Toggle on={voice} onChange={setVoice} />} />
      </Section>

      <Section title="Readability">
        <Row
          label="Text size"
          hint={`${Math.round(prefs.textScale * 100)}% of default`}
          action={
            <input
              type="range"
              min={0.85}
              max={1.4}
              step={0.05}
              value={prefs.textScale}
              onChange={(e) => update({ textScale: Number(e.target.value) })}
              className="w-32 accent-[color:var(--foreground)]"
            />
          }
        />
        <Row
          label="Line spacing"
          hint={`${Math.round(prefs.spacing * 100)}% of default`}
          action={
            <input
              type="range"
              min={0.9}
              max={1.5}
              step={0.05}
              value={prefs.spacing}
              onChange={(e) => update({ spacing: Number(e.target.value) })}
              className="w-32 accent-[color:var(--foreground)]"
            />
          }
        />
        <Row
          label="Preview"
          hint="Sample AI answer text"
          action={
            <span className="prose-chat max-w-40 text-right text-sm text-muted-foreground">
              Apply 250 kg NPK per hectare.
            </span>
          }
        />
      </Section>

      <Section title="Voice">
        <Row
          label="Continuous voice mode"
          hint="Keep the mic open and send each sentence when you pause"
          action={
            <Toggle on={prefs.continuousVoice} onChange={(v) => update({ continuousVoice: v })} />
          }
        />
        <Row
          label="Automatic retries"
          hint="Retry attempts when transcription fails"
          action={
            <select
              value={prefs.voiceRetries}
              onChange={(e) => update({ voiceRetries: Number(e.target.value) })}
              className="rounded-lg bg-background px-2 py-1 text-sm outline-none"
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Off" : `${n}×`}
                </option>
              ))}
            </select>
          }
        />
      </Section>

      <Section title="Permissions">
        <Row
          label="Camera"
          hint="Used for Plant Scanner"
          action={<Toggle on={cam} onChange={setCam} />}
        />
        <Row
          label="Location"
          hint="Used for Weather Intelligence"
          action={<Toggle on={loc} onChange={setLoc} />}
        />
      </Section>

      <Section title="Subscription">
        <Row
          label="Current plan"
          hint="FREE — upgrade anytime"
          action={
            <a href="/plans" className="text-xs font-semibold text-primary">
              Upgrade
            </a>
          }
        />
        <Row
          label="Restore purchase"
          action={
            <button
              onClick={() => alert("No previous purchase found.")}
              className="text-xs text-primary"
            >
              Restore
            </button>
          }
        />
      </Section>

      <Section title="Privacy & Security">
        <Row
          label="Privacy policy"
          action={
            <a href="/privacy" className="text-xs text-primary">
              View
            </a>
          }
        />
        <Row
          label="Terms of service"
          action={
            <a href="/terms" className="text-xs text-primary">
              View
            </a>
          }
        />
        <Row
          label="Delete account"
          hint="Removes all local data on this device"
          action={
            <button
              onClick={() => {
                if (!confirm("Delete all local data?")) return;
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("farmx-ai:") || k.startsWith("farm-ai-chat"))
                  .forEach((k) => localStorage.removeItem(k));
                alert("Local data deleted.");
                window.location.href = "/";
              }}
              className="text-xs font-semibold text-destructive"
            >
              Delete
            </button>
          }
        />
      </Section>
    </InfoPage>
  );
}
