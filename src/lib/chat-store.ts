// FarmX AI — chat history store (localStorage first, optional cloud sync)
import type { ChatMessage } from "@/components/ChatWindow";
import { fetchRemoteThreads, pushThread, removeThreadRemote } from "@/lib/chat-sync";

const INDEX_KEY = "farmx-ai:threads:index";
const THREAD_PREFIX = "farmx-ai:thread:";

export type ThreadMeta = {
  id: string;
  title: string;
  updatedAt: number;
  pinned?: boolean;
};

export function listThreads(): ThreadMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    const arr = raw ? (JSON.parse(raw) as ThreadMeta[]) : [];
    return arr.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      return b.updatedAt - a.updatedAt;
    });
  } catch {
    return [];
  }
}

function writeIndex(list: ThreadMeta[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export function getThread(id: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(THREAD_PREFIX + id);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch {
    return [];
  }
}

export function saveThread(id: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(THREAD_PREFIX + id, JSON.stringify(messages));

  const list = listThreads();
  const existing = list.find((t) => t.id === id);
  const firstUser = messages.find((m) => m.role === "user");
  const rawTitle =
    (firstUser &&
      (typeof firstUser.content === "string"
        ? firstUser.content
        : (firstUser.content.find((p) => p.type === "text")?.text ?? "New chat"))) ||
    "New chat";
  const title = rawTitle.trim().slice(0, 60) || "New chat";

  let meta: ThreadMeta;
  if (existing) {
    existing.updatedAt = Date.now();
    if (existing.title === "New chat" && firstUser) existing.title = title;
    meta = existing;
  } else {
    meta = { id, title, updatedAt: Date.now() };
    list.push(meta);
  }
  writeIndex(list);
  void pushThread(meta, messages);
}

export function createThread(): string {
  const id = crypto.randomUUID();
  return id;
}

export function renameThread(id: string, title: string) {
  const list = listThreads();
  const t = list.find((x) => x.id === id);
  if (!t) return;
  t.title = title.trim().slice(0, 80) || t.title;
  writeIndex(list);
  void pushThread(t, getThread(id));
}

export function deleteThread(id: string) {
  localStorage.removeItem(THREAD_PREFIX + id);
  writeIndex(listThreads().filter((t) => t.id !== id));
  void removeThreadRemote(id);
}

export function togglePin(id: string) {
  const list = listThreads();
  const t = list.find((x) => x.id === id);
  if (!t) return;
  t.pinned = !t.pinned;
  writeIndex(list);
  void pushThread(t, getThread(id));
}

/** Remove every locally cached conversation (used on logout). */
export function clearLocalThreads() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k === INDEX_KEY || k.startsWith(THREAD_PREFIX) || k.startsWith("farm-ai-chat"))
    .forEach((k) => localStorage.removeItem(k));
}

/**
 * Two-way merge with the cloud for a signed-in user:
 * newer copy wins per thread, local-only threads get uploaded.
 */
export async function syncThreadsWithCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  const remote = await fetchRemoteThreads();
  const local = listThreads();
  const byId = new Map(local.map((t) => [t.id, t]));

  for (const r of remote) {
    const l = byId.get(r.id);
    if (!l || r.updatedAt > l.updatedAt) {
      localStorage.setItem(THREAD_PREFIX + r.id, JSON.stringify(r.messages));
      byId.set(r.id, { id: r.id, title: r.title, updatedAt: r.updatedAt, pinned: r.pinned });
    }
  }
  writeIndex([...byId.values()]);

  const remoteIds = new Set(remote.map((r) => r.id));
  for (const l of local) {
    if (!remoteIds.has(l.id)) await pushThread(l, getThread(l.id));
  }
}
