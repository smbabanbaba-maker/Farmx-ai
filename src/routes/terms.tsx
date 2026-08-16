import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — FarmX AI" },
      { name: "description", content: "The terms that govern your use of FarmX AI." },
      { property: "og:title", content: "FarmX AI Terms of Service" },
      { property: "og:description", content: "The terms that govern your use of FarmX AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <p>By using FarmX AI you agree to these terms. FarmX AI is operated by SYLUTION LTD.</p>
      <h3 className="mt-6 text-base font-semibold">1. Use of the service</h3>
      <p>
        You agree to use FarmX AI only for lawful farming and agricultural purposes and not to
        attempt to disrupt the service.
      </p>
      <h3 className="mt-6 text-base font-semibold">2. AI recommendations</h3>
      <p>
        FarmX AI provides educational farming guidance. It can make mistakes. Always verify critical
        decisions with a local agronomist before applying chemicals or making large investments.
      </p>
      <h3 className="mt-6 text-base font-semibold">3. Subscriptions</h3>
      <p>
        Paid plans renew automatically each period until cancelled. Cancel anytime from your app
        store or Settings → Subscription.
      </p>
      <h3 className="mt-6 text-base font-semibold">4. Liability</h3>
      <p>
        To the maximum extent permitted by law, SYLUTION LTD is not liable for losses arising from
        your use of FarmX AI recommendations.
      </p>
      <h3 className="mt-6 text-base font-semibold">5. Contact</h3>
      <p>
        Questions? Email{" "}
        <a href="mailto:legal@farmx.ai" className="text-primary">
          legal@farmx.ai
        </a>
        .
      </p>
    </InfoPage>
  );
}
