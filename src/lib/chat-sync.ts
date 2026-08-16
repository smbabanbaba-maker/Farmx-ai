// FarmX AI — optional cloud sync for chat history (only when signed in)
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "@/components/ChatWindow";
import type { ThreadMeta } from "@/lib/chat-store";

export type RemoteThread = {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: number;
  messages: ChatMessage[];
};

async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Push a thread to the cloud. Silent no-op when signed out. */
export async function pushThread(meta: ThreadMeta, messages: ChatMessage[]): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await supabase.from("chat_threads").upsert(
      {
        id: meta.id,
        user_id: userId,
        title: meta.title,
        pinned: !!meta.pinned,
        messages: messages as unknown as never,
        updated_at: new Date(meta.updatedAt || Date.now()).toISOString(),
      },
      { onConflict: "id" },
    );
  } catch {
    /* offline / not signed in — local copy stays authoritative */
  }
}

export async function removeThreadRemote(id: string): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  try {
    await supabase.from("chat_threads").delete().eq("id", id).eq("user_id", userId);
  } catch {
    /* ignore */
  }
}

/** Fetch every cloud thread for the signed-in user. */
export async function fetchRemoteThreads(): Promise<RemoteThread[]> {
  const userId = await currentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, pinned, messages, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    pinned: !!row.pinned,
    updatedAt: new Date(row.updated_at).getTime(),
    messages: (row.messages ?? []) as unknown as ChatMessage[],
  }));
}
