import type { ChatMessage } from "@/components/ChatWindow";
import type { ThreadMeta } from "@/lib/chat-store";

export type RemoteThread = {
  id: string;
  title: string;
  pinned: boolean;
  updatedAt: number;
  messages: ChatMessage[];
};

async function authenticated() {
  try {
    const response = await fetch("/api/auth", { credentials: "include", cache: "no-store" });
    return response.ok && Boolean((await response.json()).authenticated);
  } catch {
    return false;
  }
}

export async function pushThread(meta: ThreadMeta, messages: ChatMessage[]): Promise<void> {
  if (!(await authenticated())) return;
  try {
    await fetch("/api/threads", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: meta.id,
        title: meta.title,
        pinned: Boolean(meta.pinned),
        updatedAt: meta.updatedAt,
        messages,
      }),
    });
  } catch {
    /* local copy remains authoritative when offline */
  }
}

export async function removeThreadRemote(id: string): Promise<void> {
  if (!(await authenticated())) return;
  try {
    await fetch(`/api/threads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch {
    /* ignore offline errors */
  }
}

export async function fetchRemoteThreads(): Promise<RemoteThread[]> {
  if (!(await authenticated())) return [];
  try {
    const response = await fetch("/api/threads", { credentials: "include", cache: "no-store" });
    if (!response.ok) return [];
    const data = (await response.json()) as { threads?: RemoteThread[] };
    return data.threads ?? [];
  } catch {
    return [];
  }
}
