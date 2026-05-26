"use client";

import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Brain,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";

import { useChatStore } from "@/lib/store";
import type { Message, ContentBlock, PresetType } from "@/lib/types";
import { parseCodeBlocks } from "@/lib/parse";
import { useTypewriter } from "@/lib/useTypewriter";
import ChatInput from "./ChatInput";

/* ─── CopyButton ─────────────────────────────────────────────── */
const CopyButton = memo(function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy code"}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
});

/* ─── CodeBlock ─────────────────────────────────────────────── */
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative group rounded-xl overflow-hidden my-3">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-xs text-slate-400 font-mono">{lang || "code"}</span>
        <CopyButton code={code} />
      </div>
      <pre className="overflow-x-auto px-4 py-3 bg-black/40">
        <code className="text-sm text-slate-200 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

/* ─── MarkdownRenderer ─────────────────────────────────────────── */
function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <table className="w-full border-collapse my-4 rounded-xl overflow-hidden">{children}</table>
        ),
        thead: ({ children }) => <thead className="bg-slate-950/80">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => (
          <tr className="hover:bg-white/5 transition-colors">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="text-left p-3 text-xs font-semibold uppercase text-blue-400 border-b border-slate-800">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="p-3 text-sm border-b border-slate-800/40 text-slate-300">{children}</td>
        ),
        hr: () => <hr className="my-6 border-t border-slate-800/80" />,
        h2: ({ children }) => (
          <h2 className="text-base font-semibold text-white mt-4 mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-medium text-slate-300 mt-3 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        li: ({ children }) => (
          <li className="text-sm leading-relaxed mb-1 ml-4 list-disc">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-white">{children}</strong>
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 text-xs font-mono" {...props}>
                {children}
              </code>
            );
          }
          return <code className={className} {...props}>{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ─── TextRenderer ─────────────────────────────────────────────── */
function TextRenderer({ content }: { content: string }) {
  const segments = parseCodeBlocks(content);
  return (
    <div className="space-y-0">
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          <CodeBlock key={i} code={seg.content.trimEnd()} lang={seg.lang || ""} />
        ) : (
          <MarkdownRenderer key={i} content={seg.content} />
        )
      )}
    </div>
  );
}

/* ─── MessageBlock ─────────────────────────────────────────────── */
function MessageBlock({
  block,
  bIdx,
  isThinkingExpanded,
  toggleThinking,
}: {
  block: ContentBlock;
  bIdx: number;
  isThinkingExpanded: boolean;
  toggleThinking: () => void;
}) {
  if (block.type === "thinking") {
    return (
      <div key={bIdx} className="mb-3 border-l-2 border-purple-500/30 pl-3">
        <button
          onClick={toggleThinking}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>Thinking Process</span>
          {isThinkingExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        {isThinkingExpanded && (
          <p className="text-xs text-slate-400/80 mt-1 italic whitespace-pre-wrap leading-relaxed">
            {block.content}
          </p>
        )}
      </div>
    );
  }

  if (block.type === "image") {
    return <img key={bIdx} src={block.url} alt="Generated" className="rounded-xl max-w-full" />;
  }

  return <TextRenderer key={bIdx} content={block.content} />;
}

/* ─── LoadingDots ─────────────────────────────────────────────── */
function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-3">
      <span className="bounce-dot" />
      <span className="bounce-dot" />
      <span className="bounce-dot" />
    </div>
  );
}

/* ─── AssistantBubble ─────────────────────────────────────────── */
function AssistantBubble({
  message,
  isThinkingExpanded,
  toggleThinking,
  showCursor,
}: {
  message: Message;
  isThinkingExpanded: boolean;
  toggleThinking: () => void;
  showCursor: boolean;
}) {
  const lastBlock = message.blocks[message.blocks.length - 1];
  const isTextType = lastBlock && lastBlock.type === "text";

  return (
    <div className="bg-white/[0.03] border border-white/[0.05] text-slate-200 rounded-2xl rounded-bl-none px-5 py-4 max-w-[85%]">
      {message.blocks.length === 0 ? (
        <LoadingDots />
      ) : (
        <>
          {message.blocks.map((block, bIdx) => (
            <MessageBlock
              key={bIdx}
              block={block}
              bIdx={bIdx}
              isThinkingExpanded={isThinkingExpanded}
              toggleThinking={toggleThinking}
            />
          ))}
          {showCursor && isTextType && (
            <span className="cursor-blink ml-0.5 inline-block" />
          )}
        </>
      )}
    </div>
  );
}

/* ─── ChatWindow ─────────────────────────────────────────────── */
interface ChatWindowProps {
  onPresetSelect?: (preset: PresetType) => void;
}

export default function ChatWindow({ onPresetSelect }: ChatWindowProps) {
  const {
    messages,
    presetType,
    isStreaming,
    isThinkingExpanded,
    setStreaming,
    addMessage,
    updateLastMessage,
    toggleThinking,
    setPresetType,
    clearMessages,
  } = useChatStore();

  // Typewriter drives updateLastMessage directly — no overlay, no extra state
  const { queueText, flushQueue } = useTypewriter(updateLastMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── submit handler ─────────────────────────────────────────── */
  const handleSubmit = useCallback(
    async (inputValue: string, deepResearch: boolean) => {
      if (isStreaming) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        blocks: [{ type: "text", content: inputValue }],
      };

      addMessage(userMessage);
      setStreaming(true);

      const assistantPlaceholder: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        blocks: [],
      };
      addMessage(assistantPlaceholder);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.concat(userMessage),
            presetType,
            deepResearch,
          }),
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let finished = false;
        let thinkingAccumulated = "";

        while (!finished) {
          const { value, done } = await reader.read();
          finished = done;

          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "reasoning-delta") {
                  thinkingAccumulated += data.text;
                  // Update store with current thinking — no throttling for reasoning
                  updateLastMessage([{ type: "thinking", content: thinkingAccumulated }]);
                } else if (data.type === "text-delta") {
                  // Feed to typewriter: drives updateLastMessage every 30ms
                  queueText(data.text, thinkingAccumulated);
                } else if (data.type === "done") {
                  finished = true;
                }
              } catch {
                // ignore partial JSON
              }
            }
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        updateLastMessage([
          { type: "text", content: "Sorry, there was an error. Please check your API key and try again." },
        ]);
      } finally {
        flushQueue();   // drains any remaining buffer into store
        setStreaming(false); // enables input, hides cursor
      }
    },
    [isStreaming, messages, presetType, addMessage, setStreaming, updateLastMessage, queueText, flushQueue]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Preset Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {(["chat", "tasks", "design", "code", "research", "writing"] as PresetType[]).map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setPresetType(preset);
              onPresetSelect?.(preset);
              clearMessages();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              presetType === preset
                ? "bg-blue-600/40 text-white border border-blue-500/30"
                : "bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={message.id ?? `msg-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "user" ? (
                <div className="max-w-[85%] bg-blue-600/35 border border-blue-500/20 text-white rounded-2xl rounded-br-none px-5 py-4">
                  {message.blocks.map((block, bIdx) => (
                    <MessageBlock
                      key={bIdx}
                      block={block}
                      bIdx={bIdx}
                      isThinkingExpanded={isThinkingExpanded}
                      toggleThinking={toggleThinking}
                    />
                  ))}
                </div>
              ) : (
                <AssistantBubble
                  message={message}
                  isThinkingExpanded={isThinkingExpanded}
                  toggleThinking={toggleThinking}
                  showCursor={isStreaming && idx === messages.length - 1}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area — isolated component */}
      <div className="p-4">
        <ChatInput disabled={isStreaming} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
