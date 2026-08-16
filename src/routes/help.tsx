import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, Row, Section } from "@/components/InfoPage";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Support — FarmX AI" },
      {
        name: "description",
        content: "Get help with FarmX AI. FAQ, contact support, report bugs and request features.",
      },
      { property: "og:title", content: "FarmX AI Help & Support" },
      { property: "og:description", content: "Contact FarmX AI support or report an issue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "What is FarmX AI?",
    a: "FarmX AI is a premium AI agronomist that helps you plan crops, diagnose plant diseases, design irrigation and manage your farm — in your own language.",
  },
  {
    q: "Which languages does FarmX AI support?",
    a: "English, Hausa, French, Arabic and most world languages. Just type in your language and FarmX AI will reply in it.",
  },
  {
    q: "Can it diagnose plant diseases from a photo?",
    a: "Yes. Open the Plant Scanner from the menu, snap or upload a photo, and FarmX AI identifies the plant, disease, treatment and prevention.",
  },
  {
    q: "Are my chats private?",
    a: "Chats are stored locally on your device. See our Privacy Policy for details.",
  },
];

function HelpPage() {
  return (
    <InfoPage title="Help & Support" subtitle="We are here to help you grow.">
      <Section title="Frequently asked questions">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="rounded-xl px-3 py-2.5"
            style={{ background: "var(--surface-2)" }}
          >
            <summary className="cursor-pointer text-sm font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </Section>

      <Section title="Contact us">
        <Row
          label="Email"
          hint="support@farmx.ai"
          action={
            <a href="mailto:support@farmx.ai" className="text-xs font-semibold text-primary">
              Email
            </a>
          }
        />
        <Row
          label="WhatsApp"
          hint="Chat with our team"
          action={
            <a href="https://wa.me/0" className="text-xs font-semibold text-primary">
              Open
            </a>
          }
        />
      </Section>

      <Section title="Feedback">
        <Row
          label="Report a bug"
          action={
            <a href="mailto:support@farmx.ai?subject=Bug%20report" className="text-xs text-primary">
              Report
            </a>
          }
        />
        <Row
          label="Request a feature"
          action={
            <a
              href="mailto:support@farmx.ai?subject=Feature%20request"
              className="text-xs text-primary"
            >
              Send
            </a>
          }
        />
      </Section>
    </InfoPage>
  );
}
