"use client";

import { Button } from "@/games/shared/components/ui";
import type { PlayMode } from "@/games/sans-le-dire/lib/game/types";

export function ModeSelectionScreen({
  onModeSelected,
}: {
  onModeSelected: (mode: PlayMode) => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center pb-1">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-text)]">
          Choisissez votre mode
        </p>
        <h1 className="display-face balance mt-2.5 text-[clamp(2rem,8vw,2.8rem)] leading-[0.88]">
          Compétition ou Fun ?
        </h1>
      </div>

      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={() => onModeSelected("competition")}
          className="flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl border border-[var(--accent)]/35 bg-[var(--accent)]/[.1] px-4 py-3 text-left transition hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/[.15] active:scale-[.98]"
        >
          <span className="text-2xl" aria-hidden="true">
            🏆
          </span>
          <span className="block text-base font-black">Compétition</span>
          <span className="block text-[10px] font-medium text-white/55">
            Faites deviner un maximum de mots et marquez des points
          </span>
        </button>

        <button
          type="button"
          onClick={() => onModeSelected("fun")}
          className="flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl border border-[#E83DFF]/35 bg-[#E83DFF]/[.1] px-4 py-3 text-left transition hover:border-[#E83DFF]/60 hover:bg-[#E83DFF]/[.15] active:scale-[.98]"
        >
          <span className="text-2xl" aria-hidden="true">
            🍺
          </span>
          <span className="block text-base font-black">Fun</span>
          <span className="block text-[10px] font-medium text-white/55">
            Faites deviner des mots et distribuez des gorgées
          </span>
        </button>
      </div>
    </section>
  );
}
