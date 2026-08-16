import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { MessageActions } from "@/components/MessageActions";
import {
  Camera,
  Mic,
  Plus,
  Send,
  Square,
  X,
  Loader2,
  Sprout,
  Leaf,
  Droplets,
  FlaskConical,
  Sparkles,
} from "lucide-react";
import { FarmAiLogo } from "@/components/FarmAiLogo";
import { createThread, getThread, saveThread } from "@/lib/chat-store";
import { VoiceSheet } from "@/components/VoiceSheet";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { authHeaders } from "@/hooks/use-entitlement";
import { guestHeaders } from "@/lib/guest";

const SUGGESTIONS = [
  { icon: Sprout, text: "I want to plant rice on 2 hectares." },
  { icon: Leaf, text: "Analyze a plant disease from a photo." },
  { icon: Droplets, text: "Design a drip irrigation system for my farm." },
  { icon: FlaskConical, text: "Calculate fertilizer requirements for maize." },
  { icon: Sparkles, text: "Create a complete farming plan for the season." },
];

export type ChatContentPart =
  { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string | ChatContentPart[];
};

function textOf(content: ChatMessage["content"]): string {
  if (typeof content === "string") return content;
  return content
    .map((p) => (p.type === "text" ? p.text : ""))
    .filter(Boolean)
    .join("\n");
}
function imagesOf(content: ChatMessage["content"]): string[] {
  if (typeof content === "string") return [];
  return content
    .filter((p): p is Extract<ChatContentPart, { type: "image_url" }> => p.type === "image_url")
    .map((p) => p.image_url.url);
}

export function ChatWindow({
  initialPrompt,
  threadId,
}: {
  initialPrompt?: string;
  threadId?: string;
}) {
  const navigate = useNavigate();
  const activeId = useMemo(() => threadId ?? createThread(), [threadId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const initialSent = useRef(false);

  useEffect(() => {
    setMessages(getThread(activeId));
    initialSent.current = false;
  }, [activeId]);

  useEffect(() => {
    if (messages.length > 0) saveThread(activeId, messages);
  }, [activeId, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeId]);

  const ensureUrl = useCallback(() => {
    if (!threadId) {
      navigate({ to: "/", search: { c: activeId } as never, replace: true });
    }
  }, [threadId, activeId, navigate]);

  /** Stream an assistant reply for the given history. */
  const run = useCallback(async (history: ChatMessage[]) => {
    setError(null);
    setStreaming(true);
    const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "" };
    setMessages([...history, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...guestHeaders(),
          ...(await authHeaders()),
        },

        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        const msg = await resp.text().catch(() => "Something went wrong.");
        throw new Error(msg || `Error ${resp.status}`);
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((cur) => {
          const copy = [...cur];
          copy[copy.length - 1] = { ...assistantMsg, content: acc };
          return copy;
        });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        setError((err as Error).message || "Failed to reach FarmX AI.");
        setMessages((cur) => (cur[cur.length - 1]?.content === "" ? cur.slice(0, -1) : cur));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, []);

  const send = useCallback(
    async (text: string, imageUrl?: string | null) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUrl) return;
      ensureUrl();

      const userContent: ChatMessage["content"] = imageUrl
        ? [
            ...(trimmed ? [{ type: "text" as const, text: trimmed }] : []),
            { type: "image_url" as const, image_url: { url: imageUrl } },
          ]
        : trimmed;

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: userContent };
      setInput("");
      setPendingImage(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      // "/image <prompt>" asks FarmX AI to draw an illustration instead of chatting.
      const imagePrompt = /^\/image\s+/i.test(trimmed) ? trimmed.replace(/^\/image\s+/i, "") : null;
      if (imagePrompt) {
        const history = [...messages, userMsg];
        setMessages(history);
        setStreaming(true);
        setError(null);
        try {
          const resp = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...guestHeaders(),
              ...(await authHeaders()),
            },
            body: JSON.stringify({ prompt: imagePrompt }),
          });
          if (!resp.ok) throw new Error((await resp.text()) || "Image generation failed.");
          const data = (await resp.json()) as { url?: string };
          setMessages([
            ...history,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: `![${imagePrompt}](${data.url ?? ""})`,
            },
          ]);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setStreaming(false);
        }
        return;
      }

      await run([...messages, userMsg]);
    },
    [messages, ensureUrl, run],
  );

  const regenerate = useCallback(
    (index: number) => {
      if (streaming) return;
      void run(messages.slice(0, index));
    },
    [messages, run, streaming],
  );

  // initial prompt / seeded user message (e.g. from the Plant Scanner)
  useEffect(() => {
    if (initialSent.current || streaming) return;
    if (initialPrompt && messages.length === 0) {
      initialSent.current = true;
      void send(initialPrompt);
      return;
    }
    const last = messages[messages.length - 1];
    if (last && last.role === "user") {
      initialSent.current = true;
      void run(messages);
    }
  }, [initialPrompt, messages, send, run, streaming]);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const voice = useVoiceRecorder({
    onFinal: (text) => {
      setVoiceOpen(false);
      void send(text, pendingImage);
    },
  });

  const openVoice = () => {
    setVoiceOpen(true);
    void voice.start();
  };
  const closeVoice = () => {
    voice.cancel();
    setVoiceOpen(false);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPendingImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const stop = () => abortRef.current?.abort();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto pb-40 pt-4">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-5 sm:px-6">
          {messages.length === 0 && (
            <div className="mt-[10vh] flex flex-col items-center text-center">
              <FarmAiLogo size={72} />
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">FarmX AI</h2>
              <p className="mt-2 text-base text-muted-foreground">How can I help you today?</p>
              <ul className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <li key={text}>
                    <button
                      onClick={() => void send(text)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border px-3 py-3 text-left text-sm transition-colors hover:bg-[color:var(--surface-2)]"
                      style={{ background: "var(--surface)" }}
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--surface-2)" }}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 text-foreground/90">{text}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble
              key={m.id}
              message={m}
              busy={streaming && i === messages.length - 1}
              onRegenerate={() => regenerate(i)}
              onFollowUp={(p) => void send(p)}
            />
          ))}

          {streaming && messages[messages.length - 1]?.content === "" && (
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              FarmX AI is thinking…
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm">
              {error}
              {/sign in|shiga account/i.test(error) && (
                <a href="/auth" className="mt-2 block font-semibold underline">
                  Sign in / Shiga
                </a>
              )}
              {/upgrade|haɓaka|GO and PRO|GO da PRO/i.test(error) && (
                <a href="/plans" className="mt-2 block font-semibold underline">
                  Upgrade plan / Haɓaka shiri
                </a>
              )}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border pb-[env(safe-area-inset-bottom)]"
        style={{
          background: "color-mix(in oklab, var(--background) 90%, transparent)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto max-w-2xl px-3 pt-3 pb-3">
          {voiceOpen && voice.state === "recording" && voice.liveText && (
            <div
              className="mb-2 animate-fade-in rounded-2xl border border-border px-3 py-2 text-sm"
              style={{ background: "var(--surface-2)" }}
            >
              <span className="mr-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                Live captions
              </span>
              <span className="break-words">{voice.liveText}</span>
            </div>
          )}
          {pendingImage && (
            <div className="mb-2 flex items-center gap-2">
              <div className="relative">
                <img
                  src={pendingImage}
                  alt="Attachment preview"
                  className="h-16 w-16 rounded-xl object-cover"
                />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -right-1 -top-1 rounded-full bg-background p-1 text-foreground shadow"
                  aria-label="Remove attachment"
                >
                  <X size={12} />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                Photo will be analyzed by FarmX AI
              </span>
            </div>
          )}
          <div className="glass-card flex items-end gap-2 rounded-3xl px-3 py-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <IconBtn onClick={() => fileRef.current?.click()} title="Attach photo">
              <Plus size={20} />
            </IconBtn>
            <IconBtn onClick={() => cameraRef.current?.click()} title="Take photo">
              <Camera size={20} />
            </IconBtn>
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input, pendingImage);
                }
              }}
              placeholder="Ask FarmX AI anything…"
              className="max-h-40 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <IconBtn title="Voice conversation" onClick={openVoice}>
              <Mic size={20} />
            </IconBtn>
            {streaming ? (
              <IconBtn onClick={stop} title="Stop" accent>
                <Square size={18} />
              </IconBtn>
            ) : (
              <IconBtn
                onClick={() => void send(input, pendingImage)}
                title="Send"
                accent
                disabled={!input.trim() && !pendingImage}
              >
                <Send size={18} />
              </IconBtn>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            FarmX AI can make mistakes. Verify critical decisions with a local agronomist.
          </p>
        </div>
      </div>

      <VoiceSheet
        open={voiceOpen}
        state={voice.state}
        liveText={voice.liveText}
        level={voice.level}
        error={voice.error}
        seconds={voice.seconds}
        onStop={() => void voice.finish()}
        onCancel={closeVoice}
        onRetry={() => void voice.retry()}
        continuous={voice.continuous}
      />
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  accent,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  accent?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40"
      style={
        accent
          ? { background: "var(--foreground)", color: "var(--background)" }
          : { background: "var(--surface-2)", color: "var(--foreground)" }
      }
    >
      {children}
    </button>
  );
}

function MessageBubble({
  message,
  busy,
  onRegenerate,
  onFollowUp,
}: {
  message: ChatMessage;
  busy?: boolean;
  onRegenerate: () => void;
  onFollowUp: (prompt: string) => void;
}) {
  const isUser = message.role === "user";
  const text = textOf(message.content);
  const images = imagesOf(message.content);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
          style={{ background: "var(--surface-2)", color: "var(--foreground)" }}
        >
          {images.map((src) => (
            <img
              key={src}
              src={src}
              alt="Attached"
              className="mb-2 max-h-48 w-full rounded-xl object-cover"
            />
          ))}
          {text && <p className="whitespace-pre-wrap break-words">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 gap-3">
      <FarmAiLogo size={26} className="mt-1" />
      <div className="min-w-0 flex-1">
        <div className="prose-chat text-sm text-foreground">
          <ChatMarkdown text={text} />
        </div>
        {!busy && text.trim() && (
          <MessageActions text={text} onRegenerate={onRegenerate} onFollowUp={onFollowUp} />
        )}
      </div>
    </div>
  );
}
