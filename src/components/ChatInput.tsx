"use client";

import React, { useState, useRef, useEffect, memo } from "react";
import { Send, Mic, Image, Search } from "lucide-react";

/* ─── ChatInput ──────────────────────────────────────────────── */
/* Isolated from chat history — only re-renders when its own state changes. */
interface ChatInputProps {
  disabled: boolean;
  onSubmit: (value: string, deepResearch: boolean) => void;
}

const ChatInput = memo(function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [deepResearch, setDeepResearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus stable even when parent re-renders
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, deepResearch);
    setInput("");
    setDeepResearch(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] rounded-2xl p-2 flex flex-col gap-2"
    >
      {/* Tool toggles */}
      <div className="flex gap-2 px-3 pt-1">
        <button
          type="button"
          onClick={() => setDeepResearch((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
            deepResearch
              ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Search className="w-3 h-3" />
          Deep Research
        </button>
      </div>

      {/* Input row */}
      <div className="flex gap-2 items-center px-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={disabled}
          className="flex-1 bg-transparent px-2 py-2 border-0 focus:outline-none text-slate-200 placeholder-slate-500 text-sm"
        />
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Image generation (coming soon)"
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Voice input (coming soon)"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white text-xs px-5 py-2.5 rounded-xl font-medium flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </div>
    </form>
  );
});

export default ChatInput;