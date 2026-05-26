"use client";

/* ─── DuckIcon ─────────────────────────────────────────────────
 * Renders a duck from the 6×6 sprite sheet at /assets/duck-spritesheet.png.
 * row and col are 0-indexed (0–5).
 *
 * Grid layout (row × col):
 *   [0,0] normal   [0,1] sleeping  [0,2] zzZ-sleep  [0,3] wide-eye  [0,4] wave     [0,5] surprised
 *   [1,0] normal   [1,1] wink       [1,2] happy     [1,3] silly      [1,4] ...      [1,5] ...
 *   [2,0] ...      [2,1] ...        [2,2] ...       [2,3] ...        [2,4] ...      [2,5] ...
 *   [3,0] ...      [3,1] ...        [3,2] ...       [3,3] ...        [3,4] ...      [3,5] ...
 *   [4,0] ...      [4,1] ...        [4,2] ...       [4,3] ...        [4,4] ...      [4,5] ...
 *   [5,0] ...      [5,1] ...        [5,2] ...       [5,3] ...        [5,4] ...      [5,5] ...
 *
 * CSS formula: background-position = (col/5 * 100%) (row/5 * 100%)
 *              background-size    = 600% 600%
 *
 * Usage:
 *   <DuckIcon row={0} col={0} size={28} />   ← normal standing duck
 *   <DuckIcon row={0} col={2} size={32} />   ← sleeping with Zzz
 *   <DuckIcon row={0} col={4} size={32} />   ← waving
 * ──────────────────────────────────────────────────────────── */

interface DuckIconProps {
  row?: number;       // 0–5, default 0
  col?: number;       // 0–5, default 0
  size?: number;      // px, default 32
  className?: string;
}

export default function DuckIcon({
  row = 0,
  col = 0,
  size = 32,
  className = "",
}: DuckIconProps) {
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
        imageRendering: "crisp-edges",
      }}
      aria-label={`Duck ${row * 6 + col + 1}`}
      role="img"
    />
  );
}
