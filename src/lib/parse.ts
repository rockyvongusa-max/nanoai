/**
 * Parses message text into semantic segments:
 * - Fenced code blocks  (```lang ...```)
 * - Heading2 / Heading3 (## / ###)
 * - Plain text with inline formatting (bold, inline code, newlines)
 */
export type SegmentType = "text" | "code" | "heading2" | "heading3" | "markdown";

export interface TextSegment {
  type: SegmentType;
  content: string;
  lang?: string; // only for type === "code"
}

const FENCE_REGEX = /```(\w*)\n?([\s\S]*?)```/g;
const HEADING_REGEX = /^(#{2,3})\s+(.+)$/gm;

/**
 * Split text on ## and ### headings, preserving heading level.
 */
function splitOnHeadings(text: string): TextSegment[] {
  const parts: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  HEADING_REGEX.lastIndex = 0;

  while ((match = HEADING_REGEX.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      parts.push({ type: "markdown", content: before } as TextSegment);
    }
    const level = match[1].length === 2 ? "heading2" : "heading3";
    parts.push({ type: level, content: match[2].trim() } as TextSegment);
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    parts.push({ type: "markdown", content: remaining } as TextSegment);
  }

  return parts;
}

/**
 * Parses a full text blob into alternating code and heading-aware text segments.
 * Text segments (non-headings) are marked as "markdown" so they can be rendered
 * by ReactMarkdown to support tables, HR, lists, bold, inline code, etc.
 */
export function parseCodeBlocks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FENCE_REGEX.lastIndex = 0;

  while ((match = FENCE_REGEX.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) {
      segments.push(...splitOnHeadings(before));
    }
    segments.push({ type: "code", content: match[2], lang: match[1] || "" });
    lastIndex = match.index + match[0].length;
  }

  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    segments.push(...splitOnHeadings(remaining));
  }

  if (segments.length === 0) {
    return [{ type: "markdown", content: text }];
  }

  return segments;
}

/** Alias for backwards compatibility */
export const splitHeadings = splitOnHeadings;

/**
 * Detect a single code block for cases where the whole text is one block.
 */
export function detectSingleCodeBlock(
  text: string
): { code: string; lang: string } | null {
  const match = text.match(/^```(\w*)\n?([\s\S]*?)```$/);
  if (match) {
    return { lang: match[1] || "", code: match[2] };
  }
  return null;
}