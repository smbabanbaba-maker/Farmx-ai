import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — FarmX AI" },
      { name: "description", content: "How FarmX AI collects, uses and protects your data." },
      { property: "og:title", content: "FarmX AI Privacy Policy" },
      { property: "og:description", content: "Our privacy commitments to you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" subtitle={`Last updated: ${new Date().toLocaleDateString()}`}>
      <p>
        This page describes how FarmX AI ("we", "our"), operated by SYLUTION LTD, handles your
        information.
      </p>
      <h3 className="mt-6 text-base font-semibold">1. Information we handle</h3>
      <p>
        Your chat messages, uploaded photos and preferences are stored locally on your device. When
        you send a message, its content is transmitted to our AI provider to generate a response.
      </p>
      <h3 className="mt-6 text-base font-semibold">2. How we use it</h3>
      <p>
        We use the data only to provide the AI response you requested and to keep your history
        available on this device.
      </p>
      <h3 className="mt-6 text-base font-semibold">3. Data you can control</h3>
      <p>
        You can delete individual chats from the side menu or wipe all local data from Settings →
        Delete account.
      </p>
      <h3 className="mt-6 text-base font-semibold">4. Children</h3>
      <p>FarmX AI is intended for users aged 13 and above.</p>
      <h3 className="mt-6 text-base font-semibold">5. Contact</h3>
      <p>
        Questions? Email{" "}
        <a href="mailto:privacy@farmx.ai" className="text-primary">
          privacy@farmx.ai
        </a>
        .
      </p>
    </InfoPage>
  );
}
