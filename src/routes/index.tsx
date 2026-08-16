import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { ChatWindow } from "@/components/ChatWindow";

const searchSchema = z.object({
  q: z.string().optional(),
  c: z.string().optional(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FarmX AI — Your Intelligent Farming Assistant" },
      {
        name: "description",
        content:
          "FarmX AI is a premium AI assistant for agriculture — crop planning, plant disease diagnosis, irrigation design, fertilizer schedules, and multilingual farming advice.",
      },
      { property: "og:title", content: "FarmX AI — Your Intelligent Farming Assistant" },
      {
        property: "og:description",
        content: "Chat with an AI agronomist. Diagnose diseases, plan crops, design irrigation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: searchSchema,
  component: Home,
});

function Home() {
  const { q, c } = Route.useSearch();
  return (
    <AppShell>
      <ChatWindow initialPrompt={q} threadId={c} />
    </AppShell>
  );
}
