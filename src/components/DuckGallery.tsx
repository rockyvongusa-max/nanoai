"use client";

/* ─── DuckGallery ──────────────────────────────────────────────
 * Displays all 36 ducks from the 6×6 sprite sheet in a grid.
 *
 * How it works (2-layer approach for mix-blend-mode):
 *   1. White bg box  — the "canvas" multiply composites against
 *   2. DuckIcon div — PNG white bg × white box = white (transparent effect)
 *                      actual duck yellow × white = stays bright
 *                      PNG transparent × white = dark sidebar bg shows through
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
            const isSelected = selected?.row === r && selected?.col === c;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => onSelect({ row: r, col: c })}
                title={DUCK_NAMES[r][c]}
                className={`
                  relative flex items-center justify-center rounded-lg
                  transition-all duration-150 cursor-pointer overflow-hidden
                  ${isSelected
                    ? "bg-blue-600/30 ring-1 ring-blue-500/60 scale-110 z-10"
                    : "bg-white/5 hover:bg-white/10 hover:scale-105"
                  }
                `}
                style={{ aspectRatio: "1" }}
              >
                {/*
                  Layer 1: Pure white bg — this is what "multiply" composites against.
                  White × White = White (duck white/bright areas stay white)
                  Transparent × White = dark sidebar bg shows through
                */}
                <div className="absolute inset-0 rounded-lg bg-white" />

                {/*
                  Layer 2: Duck with mix-blend-mode: multiply
                  The PNG's white areas blend with the white div below = white
                  The PNG's actual yellow duck colors × white = stays bright yellow
                */}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ mixBlendMode: "multiply" }}
                >
                  <DuckIcon
                    row={r}
                    col={c}
                    size={36}
                    className={isSelected ? "opacity-100" : "opacity-95"}
                  />
                </div>
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <p className="text-xs text-blue-400 mt-2 text-center font-display">
          {DUCK_NAMES[selected.row][selected.col]} selected
        </p>
      )}
    </div>
  );
}
