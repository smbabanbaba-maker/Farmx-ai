import { createFileRoute } from "@tanstack/react-router";
import { getSessionUser } from "@/lib/auth.server";
import { ensureSchema, query } from "@/lib/db.server";

export const Route = createFileRoute("/api/threads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return Response.json({ threads: [] }, { status: 401 });
        await ensureSchema();
        const result = await query<{
          id: string;
          title: string;
          pinned: boolean;
          updated_at: string;
          messages: unknown[];
        }>(
          "SELECT id, title, pinned, updated_at, messages FROM chat_threads WHERE user_id = $1 ORDER BY updated_at DESC",
          [user.id],
        );
        return Response.json({
          threads: result.rows.map((row) => ({
            id: row.id,
            title: row.title,
            pinned: row.pinned,
            updatedAt: new Date(row.updated_at).getTime(),
            messages: row.messages ?? [],
          })),
        });
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
        if (!body.id || !body.title || !Array.isArray(body.messages))
          return new Response("Invalid thread", { status: 400 });
        await ensureSchema();
        await query(
          `INSERT INTO chat_threads (id, user_id, title, pinned, messages, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, COALESCE($6::timestamptz, NOW()))
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, pinned = EXCLUDED.pinned, messages = EXCLUDED.messages, updated_at = EXCLUDED.updated_at
           WHERE chat_threads.user_id = $2`,
          [
            body.id,
            user.id,
            body.title.slice(0, 200),
            Boolean(body.pinned),
            JSON.stringify(body.messages),
            body.updatedAt ? new Date(body.updatedAt).toISOString() : null,
          ],
        );
        return Response.json({ ok: true });
      },
      DELETE: async ({ request }) => {
        const user = await getSessionUser(request);
        if (!user) return new Response("Unauthorized", { status: 401 });
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return new Response("Thread id required", { status: 400 });
        await ensureSchema();
        await query("DELETE FROM chat_threads WHERE id = $1 AND user_id = $2", [id, user.id]);
        return Response.json({ ok: true });
      },
    },
  },
});
