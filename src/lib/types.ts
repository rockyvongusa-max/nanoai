// ============================================================
// NanoAI TypeScript Type Definitions
// ============================================================

// Preset types for the action cards
export type PresetType = "chat" | "tasks" | "design" | "code" | "research" | "writing";

// Content block types for messages
export interface ThinkingBlock {
  type: "thinking";
  content: string;
}

export interface TextBlock {
  type: "text";
  content: string;
}

export interface ImageBlock {
  type: "image";
  url: string;
}

export type ContentBlock = ThinkingBlock | TextBlock | ImageBlock;

// Chat message structure
export interface Message {
  id?: string;
  role: "user" | "assistant";
  blocks: ContentBlock[];
}

// Chat session structure
export interface Chat {
  id: string;
  title: string;
  user_id: string;
  space_id?: string;
  preset_type: PresetType;
  created_at: string;
}

// Space (workspace) structure
export interface Space {
  id: string;
  name: string;
  user_id: string;
  icon: string;
  created_at: string;
}

// User profile with encrypted API key
export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  encrypted_minimax_key?: string;
}

// API request body for /api/chat
export interface ChatRequest {
  messages: Message[];
  chatId?: string;
  spaceId?: string;
  presetType?: PresetType;
  deepResearch?: boolean;
}

// SSE streaming event types
export interface ThinkingEvent {
  type: "thinking";
  text: string;
}

export interface TextEvent {
  type: "text";
  text: string;
}

export interface DoneEvent {
  type: "done";
}

export type StreamEvent = ThinkingEvent | TextEvent | DoneEvent;

// System prompt presets with temperature settings
export const PRESET_CONFIG: Record<
  PresetType,
  { systemPrompt: string; temperature: number }
> = {
  chat: {
    systemPrompt:
      "You are a helpful, knowledgeable assistant. Provide clear, structured, and friendly responses.",
    temperature: 0.7,
  },
  tasks: {
    systemPrompt:
      "You are an expert task planner. Break down complex tasks into clear, actionable steps. Provide checklists and verify each step.",
    temperature: 0.2,
  },
  design: {
    systemPrompt:
      "You are a creative design expert. Generate design tokens, UI structure recommendations, and creative copy. Think visually.",
    temperature: 0.8,
  },
  code: {
    systemPrompt:
      "You are an expert software engineer. Generate clean, well-structured, production-ready code. Include tests and follow best practices.",
    temperature: 0.1,
  },
  research: {
    systemPrompt:
      "You are a thorough research assistant. Synthesize information objectively, highlight knowledge gaps, and provide structured summaries.",
    temperature: 0.3,
  },
  writing: {
    systemPrompt:
      "You are a creative writer. Craft natural, engaging content with a distinct voice. Focus on storytelling and authentic expression.",
    temperature: 0.9,
  },
};

// Deep research prefix (prepended for deep research mode)
export const DEEP_RESEARCH_PREFIX =
  "Think thoroughly. Work out alternative methods, write down your reasoning steps exhaustively before producing any final conclusions.";