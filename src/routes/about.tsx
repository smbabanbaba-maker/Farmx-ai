import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Row, Section } from "@/components/InfoPage";
import { FarmAiLogo } from "@/components/FarmAiLogo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About FarmX AI" },
      {
        name: "description",
        content: "FarmX AI — a premium AI agronomist built by SYLUTION LTD for modern farmers.",
      },
      { property: "og:title", content: "About FarmX AI" },
      { property: "og:description", content: "Built by SYLUTION LTD for modern farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <InfoPage title="About FarmX AI">
      <div className="mt-2 flex items-center gap-3">
        <FarmAiLogo size={56} />
        <div>
          <p className="text-base font-semibold">FarmX AI</p>
          <p className="text-xs text-muted-foreground">Your intelligent farming assistant</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-foreground/90">
        FarmX AI is a premium AI agronomist that helps farmers plan crops, diagnose diseases, design
        irrigation, calculate fertilizer, and manage a modern farm — all through a friendly chat
        that speaks your language.
      </p>

      <Section title="Company">
        <Row label="Developed by" hint="SYLUTION LTD" />
        <Row label="Version" hint="1.0.0" />
        <Row
          label="Website"
          hint="www.farmx.ai"
          action={
            <a href="https://www.farmx.ai" className="text-xs font-semibold text-primary">
              Visit
            </a>
          }
        />
        <Row
          label="Email"
          hint="hello@farmx.ai"
          action={
            <a href="mailto:hello@farmx.ai" className="text-xs font-semibold text-primary">
              Email
            </a>
          }
        />
      </Section>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} SYLUTION LTD. All rights reserved.
      </p>
    </InfoPage>
  );
}
