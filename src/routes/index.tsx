import { createFileRoute } from "@tanstack/react-router";
import { AgroGuardHome } from "@/components/AgroGuardHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgroGuard — FarmX AI Crop Health" },
      {
        name: "description",
        content:
          "AgroGuard by FarmX AI provides preliminary AI vision guidance for tomato crop health.",
      },
      { property: "og:title", content: "AgroGuard — FarmX AI Crop Health" },
      {
        property: "og:description",
        content: "Upload a tomato leaf and receive structured preliminary crop-health guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#277553" },
    ],
  }),
  component: AgroGuardHome,
});
