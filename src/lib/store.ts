import { create } from "zustand";
import type { Message, PresetType, Chat, Space } from "./types";

interface ChatState {
  // Current session
  currentChatId: string | null;
  messages: Message[];
  presetType: PresetType;
  isStreaming: boolean;

  // Chat list
  chats: Chat[];
  spaces: Space[];

  // UI state
  isThinkingExpanded: boolean;

  // Actions
  setPresetType: (type: PresetType) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (blocks: Message["blocks"]) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
  toggleThinking: () => void;
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentChatId: null,
  messages: [],
  presetType: "chat",
  isStreaming: false,
  chats: [],
  spaces: [],
  isThinkingExpanded: true,

  setPresetType: (type) => set({ presetType: type }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastMessage: (blocks) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          blocks,
        };
      }
      return { messages };
    }),

  clearMessages: () => set({ messages: [], currentChatId: null }),

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  toggleThinking: () =>
    set((state) => ({ isThinkingExpanded: !state.isThinkingExpanded })),

  setChats: (chats) => set({ chats }),

  addChat: (chat) =>
    set((state) => ({ chats: [chat, ...state.chats] })),
}));