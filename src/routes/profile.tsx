import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InfoPage, Row, Section } from "@/components/InfoPage";
import { listThreads } from "@/lib/chat-store";
import { User } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — FarmX AI" },
      {
        name: "description",
        content: "Your FarmX AI profile: farmer details, farm location, crops and plan.",
      },
      { property: "og:title", content: "FarmX AI Profile" },
      { property: "og:description", content: "Manage your farmer profile inside FarmX AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const FIELDS = [
  { key: "name", label: "Full name", placeholder: "Your name" },
  { key: "farm", label: "Farm name", placeholder: "e.g. Sabon Gari Farms" },
  { key: "location", label: "Location", placeholder: "State, Country" },
  { key: "size", label: "Farm size", placeholder: "e.g. 3 hectares" },
  { key: "crops", label: "Main crops", placeholder: "e.g. Maize, Rice" },
  { key: "phone", label: "Phone", placeholder: "+234…" },
] as const;

function ProfilePage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [threads, setThreads] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setValues(JSON.parse(localStorage.getItem("farmx-ai:profile") || "{}"));
    } catch {
      setValues({});
    }
    setThreads(listThreads().length);
  }, []);

  const set = (key: string, v: string) => {
    const next = { ...values, [key]: v };
    setValues(next);
    localStorage.setItem("farmx-ai:profile", JSON.stringify(next));
    localStorage.setItem("farmx-ai:profile:name", next.name || "Farmer");
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <InfoPage title="Profile" subtitle="Your details help FarmX AI give advice tuned to your farm.">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border"
          style={{ background: "var(--surface-2)" }}
        >
          <User size={26} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{values.name || "Farmer"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {values.location || "Location not set"} · {threads} conversation
            {threads === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <Section title="Farmer details">
        {FIELDS.map((f) => (
          <Row
            key={f.key}
            label={f.label}
            action={
              <input
                value={values[f.key] ?? ""}
                placeholder={f.placeholder}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-44 rounded-lg bg-background px-2 py-1 text-right text-sm outline-none placeholder:text-muted-foreground"
              />
            }
          />
        ))}
      </Section>

      <Section title="Plan">
        <Row
          label="Current plan"
          hint="FREE"
          action={
            <a href="/plans" className="text-xs font-semibold underline">
              Upgrade
            </a>
          }
        />
      </Section>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        {saved ? "Saved" : "Changes save automatically on this device."}
      </p>
    </InfoPage>
  );
}
