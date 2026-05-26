import { useRef, useCallback } from "react";

/* ─── useTypewriter ─────────────────────────────────────────────
 * Buffers incoming stream tokens and drains them at a controlled pace
 * so text appears character-by-character at ~25–35ms intervals.
 *
 * Usage:
 *   const { queueText, flushQueue, displayText } = useTypewriter();
 *
 *   // When a new token arrives from the SSE stream:
 *   queueText(token);
 *
 *   // When stream completes:
 *   flushQueue();  // drains remaining buffer immediately
 *
 *   displayText  — the gradually-growing string to render
 * ─────────────────────────────────────────────────────────────── */

const TICK_MS = 30;       // ms between each character render
const FLUSH_THRESHOLD = 80; // if buffer exceeds this many chars, skip ahead

export function useTypewriter() {
  // The string built so far — this is what the UI renders
  const displayTextRef = useRef("");

  // Internal buffer: queue of character chunks still waiting to render
  const bufferRef = useRef<string[]>([]);

  // raf ID for the draining interval
  const drainTimerRef = useRef<number | null>(null);

  // Currently draining?
  const drainingRef = useRef(false);

  /* Drain the buffer at TICK_MS per character */
  const startDrain = useCallback(() => {
    if (drainingRef.current) return;
    drainingRef.current = true;

    const tick = () => {
      if (bufferRef.current.length === 0) {
        drainingRef.current = false;
        drainTimerRef.current = null;
        return;
      }

      // Flush all at once if buffer is huge — keeps typing responsive
      if (bufferRef.current.length > FLUSH_THRESHOLD) {
        const all = bufferRef.current.join("");
        bufferRef.current = [];
        displayTextRef.current += all;
      } else {
        const next = bufferRef.current.shift();
        if (next !== undefined) {
          displayTextRef.current += next;
        }
      }

      drainTimerRef.current = window.setTimeout(tick, TICK_MS);
    };

    drainTimerRef.current = window.setTimeout(tick, TICK_MS);
  }, []);

  /* Add a text chunk to the buffer and start draining */
  const queueText = useCallback(
    (chunk: string) => {
      if (chunk.length === 0) return;
      bufferRef.current.push(chunk);
      startDrain();
    },
    [startDrain]
  );

  /* Drain the entire remaining buffer immediately */
  const flushQueue = useCallback(() => {
    if (drainTimerRef.current !== null) {
      clearTimeout(drainTimerRef.current);
      drainTimerRef.current = null;
    }
    drainingRef.current = false;
    // First: flush any remaining buffered characters into displayText
    if (bufferRef.current.length > 0) {
      displayTextRef.current += bufferRef.current.join("");
      bufferRef.current = [];
    }
    // Immediately clear displayText so the overlay disappears
    // before the setStreaming(false) re-render fires.
    // The final full text is already safe in the message store.
    displayTextRef.current = "";
  }, []);

  return { queueText, flushQueue, displayText: displayTextRef };
}