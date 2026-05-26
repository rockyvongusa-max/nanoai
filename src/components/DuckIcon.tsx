"use client";

/* ─── DuckIcon ─────────────────────────────────────────────────
 * Renders a duck from a 6×6 sprite sheet.
 * row and col are 0-indexed (0–5).
 *
 * Layout of the 6×6 grid:
 *   Row 0: normal, sleeping, deep-sleep, normal, wink-wave, surprised
 *   Row 1: normal, wink, sleeping, derp, confused, [continues...]
 *   Row 2: [continues...]
 *   ...
 *
 * The sprite PNG is 600% × 600% (each cell = 100% of container size).
 * CSS background-position formula: x = col/5 * 100%, y = row/5 * 100%
 *
 * Usage:
 *   <DuckIcon row={0} col={0} size={32} />
 *   <DuckIcon row={2} col={3} size={48} className="opacity-50" />
 * ──────────────────────────────────────────────────────────── */

interface DuckIconProps {
  row: number;           // 0–5
  col: number;           // 0–5
  size?: number;         // px, default 32
  className?: string;
}

export default function DuckIcon({ row, col, size = 32, className = "" }: DuckIconProps) {
  const max = 5;
  const x = (col / max) * 100;
  const y = (row / max) * 100;

  return (
    <div
      className={`inline-block flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: "url('/assets/duck-spritesheet.png')",
        backgroundSize: "600% 600%",
        backgroundPosition: `${x}% ${y}%`,
      }}
      aria-label={`Duck ${row * 6 + col + 1}`}
      role="img"
    />
  );
}
