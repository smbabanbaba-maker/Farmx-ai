import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth.server";
import { supabaseDataRequest } from "@/lib/supabase-data.server";

export const Route = createFileRoute("/api/threads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return Response.json({ threads: [] }, { status: 401 });
        try {
          const rows = await supabaseDataRequest<
            Array<{
              id: string;
              title: string;
              pinned: boolean;
              updated_at: string;
              messages: unknown[];
            }>
          >(
            request,
            `chat_threads?user_id=eq.${encodeURIComponent(user.id)}&select=id,title,pinned,updated_at,messages&order=updated_at.desc`,
          );
          return Response.json({
            threads: rows.map((row) => ({
              id: row.id,
              title: row.title,
              pinned: row.pinned,
              updatedAt: new Date(row.updated_at).getTime(),
              messages: row.messages ?? [],
            })),
          });
        } catch (error) {
          console.warn("Supabase thread list unavailable", error);
          return Response.json({ threads: [] });
        }
      },
      POST: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });
        const body = (await request.json()) as {
          id?: string;
          title?: string;
          pinned?: boolean;
          updatedAt?: number;
          messages?: unknown[];
        };
        if (!body.id || !body.title || !Array.isArray(body.messages)) {
          return new Response("Invalid thread", { status: 400 });
        }
        try {
          await supabaseDataRequest(request, "chat_threads", {
            method: "POST",
            headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
            body: JSON.stringify({
              id: body.id,
              user_id: user.id,
              title: body.title.slice(0, 200),
              pinned: Boolean(body.pinned),
              messages: body.messages,
              updated_at: body.updatedAt
                ? new Date(body.updatedAt).toISOString()
                : new Date().toISOString(),
            }),
          });
          return Response.json({ ok: true });
        } catch (error) {
          console.error("Supabase thread save failed", error);
          return new Response("Could not save thread", { status: 503 });
        }
      },
      DELETE: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return new Response("Thread id required", { status: 400 });
        try {
          await supabaseDataRequest(
            request,
            `chat_threads?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}`,
            { method: "DELETE" },
          );
          return Response.json({ ok: true });
        } catch (error) {
          console.error("Supabase thread delete failed", error);
          return new Response("Could not delete thread", { status: 503 });
        }
      },
    },
  },
});
