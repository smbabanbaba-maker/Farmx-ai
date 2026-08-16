import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

/**
 * FarmX AI answer renderer.
 * Responses are always rendered in full — never collapsed, never truncated.
 * Everything is left aligned, wraps automatically and fits the mobile viewport.
 */
export function ChatMarkdown({ text }: { text: string; streaming?: boolean }) {
  return (
    <div className="chat-answer text-left">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => <div className="answer-table">{children}</div>,
          h2: ({ children }) => <H level={2}>{children}</H>,
          h3: ({ children }) => <H level={3}>{children}</H>,
          img: ({ src, alt }) => (
            <img
              src={typeof src === "string" ? src : undefined}
              alt={alt ?? "Illustration"}
              loading="lazy"
              className="my-3 w-full max-w-full rounded-2xl border border-border object-contain"
            />
          ),
        }}
      >
        {text || "…"}
      </ReactMarkdown>
    </div>
  );
}

function H({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const Tag = level === 2 ? "h2" : "h3";
  return (
    <Tag className={level === 2 ? "answer-h2" : "answer-h3"}>
      {level === 2 && <span aria-hidden className="answer-h2-bar" />}
      <span className="min-w-0 break-words">{children}</span>
    </Tag>
  );
}
