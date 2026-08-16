import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { StitchLinkHome } from "@/components/StitchLinkHome";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StitchLink — Your Fashion Marketplace" },
      {
        name: "description",
        content:
          "Discover clothing, fabrics, sewing materials, accessories and independent fashion shops across Nigeria.",
      },
      { property: "og:title", content: "StitchLink — Your Fashion Marketplace" },
      { property: "og:description", content: "Find pieces that feel like you." },
      { property: "og:type", content: "website" },
    ],
  }),
  validateSearch: searchSchema,
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <StitchLinkHome />
    </AppShell>
  );
}
