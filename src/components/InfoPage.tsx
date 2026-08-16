import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";

export function InfoPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-24">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="prose-chat mt-6 text-sm text-foreground/90">{children}</div>
      </div>
    </AppShell>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      className="mt-6 rounded-2xl border border-border p-4"
      style={{ background: "var(--surface)" }}
    >
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

export function Row({ label, hint, action }: { label: string; hint?: string; action?: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
      style={{ background: "var(--surface-2)" }}
    >
      <div className="min-w-0">
        <p className="truncate text-sm">{label}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
