import { useRef, useCallback } from "react";

/* ─── useTypewriter ─────────────────────────────────────────────
 * Drives a 30ms-per-character typewriter loop that syncs text
 * directly into the message store via updateLastMessage.
 *
 * Usage:
 *   const { queueText, flushQueue } = useTypewriter(updateLastMessage);
 *
 *   queueText(token)  — buffers token, writes to store every 30ms
 *   flushQueue()     — drains remaining buffer into store immediately
 * ─────────────────────────────────────────────────────────────── */

const TICK_MS = 30;           // ms between each character render
const FLUSH_THRESHOLD = 100;  // if buffer exceeds this many chars, flush all at once

type UpdateFn = (blocks: { type: "thinking" | "text"; content: string }[]) => void;

export function useTypewriter(updateLastMessage: UpdateFn) {
  // Queue of character chunks waiting to be rendered
  const bufferRef = useRef<string[]>([]);

  // Current accumulated text being built character by character
  const textRef = useRef("");

  // Accumulated thinking text (written to store on every reasoning-delta)
  const thinkingRef = useRef("");

  // Interval timer ID
  const timerRef = useRef<number | null>(null);

  // Whether the drain loop is currently running
  const drainingRef = useRef(false);

  /* Drain the buffer at TICK_MS per character, writing to the store */
  const startDrain = useCallback(() => {
    if (drainingRef.current) return;
    drainingRef.current = true;

    const tick = () => {
      if (bufferRef.current.length === 0) {
        drainingRef.current = false;
        timerRef.current = null;
        return;
      }

      // If buffer is huge, flush all at once to stay responsive
      if (bufferRef.current.length > FLUSH_THRESHOLD) {
        const all = bufferRef.current.join("");
        bufferRef.current = [];
        textRef.current += all;
      } else {
        const next = bufferRef.current.shift();
        if (next !== undefined) {
          textRef.current += next;
        }
      }

      // Write the current accumulated text to the message store
      updateLastMessage([
        { type: "thinking", content: thinkingRef.current },
        { type: "text", content: textRef.current },
      ]);

      timerRef.current = window.setTimeout(tick, TICK_MS);
    };

    timerRef.current = window.setTimeout(tick, TICK_MS);
  }, [updateLastMessage]);

  /* Add a text chunk to the buffer and start the drain loop */
  const queueText = useCallback(
    (chunk: string, thinking: string) => {
      if (chunk.length === 0) return;
      thinkingRef.current = thinking; // keep thinking in sync
      bufferRef.current.push(chunk);
      startDrain();
    },
    [startDrain]
  );

  /* Flush the entire remaining buffer immediately into the store */
  const flushQueue = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    drainingRef.current = false;

    // Dump remaining buffer into textRef
    if (bufferRef.current.length > 0) {
      textRef.current += bufferRef.current.join("");
      bufferRef.current = [];
    }

    // Write final text to the store — this is the authoritative final state
    updateLastMessage([
      { type: "thinking", content: thinkingRef.current },
      { type: "text", content: textRef.current },
    ]);

    // Reset for next stream
    textRef.current = "";
  }, [updateLastMessage]);

  return { queueText, flushQueue };
}
