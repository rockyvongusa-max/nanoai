"use client";

import { useState } from "react";
import { useChatStore } from "@/lib/store";
import { Plus, Search, Trash2, MessageSquare, FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import type { PresetType } from "@/lib/types";
import DuckIcon from "./DuckIcon";
import DuckGallery from "./DuckGallery";

interface SidebarProps {
  onClose?: () => void;
}

const PRESET_ICONS: Record<PresetType, string> = {
  chat: "💬",
  tasks: "📋",
  design: "🎨",
  code: "💻",
  research: "🔬",
  writing: "✍️",
};

export default function Sidebar({ onClose }: SidebarProps) {
  const { chats, spaces, clearMessages } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [spacesExpanded, setSpacesExpanded] = useState(true);
  const [selectedDuck, setSelectedDuck] = useState({ row: 0, col: 0 });

  return (
    <div className="h-full flex flex-col bg-slate-950/50 border-r border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DuckIcon
              row={selectedDuck.row}
              col={selectedDuck.col}
              size={24}
              className="opacity-90 drop-shadow-[0_0_6px_rgba(253,224,71,0.25)]"
            />
            <h2 className="text-sm font-display font-semibold text-white tracking-tight">NanoAI</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={clearMessages}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 rounded-xl text-sm text-blue-300 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-white/10"
          />
        </div>
      </div>

      {/* Spaces Section */}
      <div className="px-4 py-3 border-b border-white/5">
        <button
          onClick={() => setSpacesExpanded(!spacesExpanded)}
          className="flex items-center gap-2 text-xs font-display font-medium text-slate-400 hover:text-white transition-colors w-full"
        >
          {spacesExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <FolderOpen className="w-3.5 h-3.5" />
          Spaces
        </button>

        {spacesExpanded && (
          <div className="mt-2 space-y-1">
            {spaces.length === 0 ? (
              <p className="text-xs text-slate-500 px-2 py-1">No spaces yet</p>
            ) : (
              spaces.map((space) => (
                <button
                  key={space.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <span>{space.icon}</span>
                  {space.name}
                </button>
              ))
            )}
            <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-all">
              <Plus className="w-3 h-3" />
              New Space
            </button>
          </div>
        )}
      </div>

      {/* Duck Gallery */}
      <DuckGallery selected={selectedDuck} onSelect={setSelectedDuck} />

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <p className="text-xs font-display font-medium text-slate-500 mb-2">Recent Chats</p>
        <div className="space-y-1">
          {chats.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span className="flex-1 text-left truncate">{chat.title}</span>
                <span className="text-xs">{PRESET_ICONS[chat.preset_type]}</span>
                <Trash2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="bg-white/[0.03] rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Powered by</p>
          <p className="text-sm font-medium text-white">MiniMax-M2.7</p>
          <p className="text-xs text-slate-500 mt-0.5">Reasoning model</p>
        </div>
      </div>
    </div>
  );
}