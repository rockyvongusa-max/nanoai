"use client";

/* ─── DuckGallery ──────────────────────────────────────────────
 * Displays all 36 ducks from the 6×6 sprite sheet in a grid.
 * Uses mix-blend-mode: multiply so the white PNG background
 * becomes transparent against the dark sidebar.
 *
 * Usage:
 *   <DuckGallery selected={selected} onSelect={setSelected} />
 * ──────────────────────────────────────────────────────────── */

import DuckIcon from "./DuckIcon";

const DUCK_NAMES: string[][] = [
  ["normal", "sleeping", "zzz-sleep", "wide-eye", "waving", "surprised"],
  ["normal-2", "wink", "happy", "silly", "thinking", "confused"],
  ["cool", "angel", "devil", "sunglasses", "pirate", "king"],
  ["chef", "mechanic", "astronaut", "firefighter", "doctor", "ninja"],
  ["guitar", "piano", "camera", "book", "rocket", "heart"],
  ["star", "rainbow", "fire", "water", "leaf", "sparkle"],
];

interface DuckGalleryProps {
  selected: { row: number; col: number } | null;
  onSelect: (pos: { row: number; col: number }) => void;
}

export default function DuckGallery({ selected, onSelect }: DuckGalleryProps) {
  return (
    <div className="px-4 py-3 border-b border-white/5">
      <p className="text-xs font-display font-medium text-slate-500 mb-3">
        Duck Avatars
      </p>

      {/* 6×6 duck grid */}
      <div className="grid grid-cols-6 gap-1">
        {DUCK_NAMES.map((row, r) =>
          row.map((_, c) => {
            const isSelected =
              selected?.row === r && selected?.col === c;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSelect({ row: r, col: c })}
                title={DUCK_NAMES[r][c]}
                className={`
                  relative flex items-center justify-center rounded-lg
                  transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? "bg-blue-600/30 ring-1 ring-blue-500/50 scale-110 z-10"
                    : "bg-white/[0.04] hover:bg-white/[0.08] hover:scale-105"
                  }
                `}
                style={{
                  aspectRatio: "1",
                  // mix-blend-mode: multiply → white PNG bg becomes dark
                  backgroundColor: isSelected ? undefined : "#0f172a",
                  mixBlendMode: "multiply",
                }}
              >
                <DuckIcon
                  row={r}
                  col={c}
                  size={28}
                  className={`
                    ${isSelected ? "opacity-100" : "opacity-90"}
                  `}
                />
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <p className="text-xs text-blue-400 mt-2 text-center">
          {DUCK_NAMES[selected.row][selected.col]} selected
        </p>
      )}
    </div>
  );
}
