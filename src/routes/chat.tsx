import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

// Chat is the app itself now — redirect to root.
export const Route = createFileRoute("/chat")({
  validateSearch: searchSchema,
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/", search });
  },
  component: () => null,
});
