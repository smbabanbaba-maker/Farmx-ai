import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Crown, Sparkles, Leaf } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { authHeaders, useEntitlement } from "@/hooks/use-entitlement";
import { PLAN_LABEL } from "@/lib/plans";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "FarmX AI Plans — Free, GO & PRO" },
      {
        name: "description",
        content:
          "Choose your FarmX AI plan. Free for basic chat, GO for daily farming, PRO for unlimited AI-powered farm design.",
      },
      { property: "og:title", content: "FarmX AI Plans" },
      { property: "og:description", content: "Free, GO and PRO plans for FarmX AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlansPage,
});

type Plan = {
  name: string;
  price: string;
  tagline: string;
  cta: string;
  featured?: boolean;
  features: string[];
  icon: typeof Leaf;
};

const PLANS: Plan[] = [
  {
    name: "FREE",
    price: "₦0",
    tagline: "Start farming smarter today.",
    cta: "Current plan",
    icon: Leaf,
    features: [
      "Basic AI Chat",
      "10 messages per day",
      "5 plant scans per day",
      "Weather updates",
      "Basic farming advice",
    ],
  },
  {
    name: "GO",
    price: "₦7,500",
    tagline: "For daily farmers who want more.",
    cta: "Upgrade to GO",
    featured: true,
    icon: Sparkles,
    features: [
      "More AI messages",
      "100 plant scans per month",
      "Voice AI",
      "Crop Planner",
      "Fertilizer & Irrigation calculators",
      "Chat history",
      "Priority speed",
      "PDF reports",
    ],
  },
  {
    name: "PRO",
    price: "₦25,000",
    tagline: "Everything a modern farm needs.",
    cta: "Go PRO",
    icon: Crown,
    features: [
      "Everything in GO",
      "Unlimited AI chat",
      "Unlimited plant scans",
      "Unlimited PDF reports",
      "AI Farm Designer",
      "Drip Irrigation Designer",
      "Yield prediction",
      "Advanced analytics",
      "Priority AI processing",
      "Early access features",
    ],
  },
];

function PlansPage() {
  const { plan: currentPlan, loading, refresh } = useEntitlement();
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Coming back from Paystack: confirm the transaction and unlock the plan.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") ?? params.get("trxref");
    if (!reference) return;
    (async () => {
      setNotice("Ana tabbatar da biyan kuɗi… / Confirming your payment…");
      const resp = await fetch("/api/pay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({ reference }),
      });
      const data = (await resp.json().catch(() => ({}))) as { status?: string };
      if (data.status === "success") {
        setNotice("An kunna shirinka! / Payment confirmed — your plan is active.");
        refresh();
      } else {
        setNotice("Ba a tabbatar da biyan kuɗi ba tukuna. / Payment not confirmed yet.");
      }
      window.history.replaceState({}, "", window.location.pathname);
    })();
  }, [refresh]);

  const upgrade = async (planId: "go" | "pro") => {
    setBusy(planId);
    setNotice(null);
    try {
      const resp = await fetch("/api/pay/init", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body: JSON.stringify({
          plan: planId,
          callbackUrl: `${window.location.origin}/plans`,
        }),
      });
      if (!resp.ok) {
        setNotice((await resp.text()) || "Could not start payment.");
        return;
      }
      const data = (await resp.json()) as { authorization_url?: string };
      if (data.authorization_url) window.location.href = data.authorization_url;
    } catch {
      setNotice("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <div className="pb-16">
        <header className="mx-auto max-w-md px-5 pt-6 text-center">
          <FarmAiLogo size={56} className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Choose your <span className="brand-gradient-text">FarmX AI</span> plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cancel anytime. Prices in Nigerian Naira. Card, bank transfer, USSD & more.
          </p>
          {!loading && (
            <p className="mt-2 text-xs text-muted-foreground">
              Current plan: <span className="font-semibold">{PLAN_LABEL[currentPlan]}</span>
            </p>
          )}
          {notice && (
            <p
              className="mt-3 rounded-2xl px-3 py-2 text-xs"
              style={{ background: "var(--surface-2)" }}
            >
              {notice}
            </p>
          )}
        </header>

        <main className="mx-auto mt-8 max-w-md space-y-4 px-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <article
                key={plan.name}
                className="relative rounded-3xl p-5"
                style={
                  plan.featured
                    ? {
                        background: "var(--surface)",
                        border: "1px solid transparent",
                        backgroundImage:
                          "linear-gradient(var(--surface), var(--surface)), var(--gradient-brand)",
                        backgroundOrigin: "border-box",
                        backgroundClip: "padding-box, border-box",
                        boxShadow: "var(--shadow-glow)",
                      }
                    : { background: "var(--surface)", border: "1px solid var(--border)" }
                }
              >
                {plan.featured && (
                  <span
                    className="absolute -top-2 right-5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    Most Popular
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ background: "var(--surface-2)", color: "var(--primary)" }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.name === "FREE" ? "forever" : "/month"}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0"
                        style={{ color: "var(--primary)" }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  disabled={
                    busy !== null || plan.name === "FREE" || currentPlan === plan.name.toLowerCase()
                  }
                  onClick={() => void upgrade(plan.name.toLowerCase() as "go" | "pro")}
                  className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold disabled:opacity-60"
                  style={
                    plan.featured
                      ? {
                          background: "var(--gradient-brand)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          background: "var(--surface-2)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }
                  }
                >
                  {currentPlan === plan.name.toLowerCase()
                    ? "Current plan"
                    : busy === plan.name.toLowerCase()
                      ? "Opening checkout…"
                      : plan.cta}
                </button>
              </article>
            );
          })}
        </main>
      </div>
    </AppShell>
  );
}
