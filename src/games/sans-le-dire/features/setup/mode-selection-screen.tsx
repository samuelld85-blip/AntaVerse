"use client";

import type { PlayMode } from "@/games/sans-le-dire/lib/game/types";

export function ModeSelectionScreen({
  onModeSelected,
}: {
  onModeSelected: (mode: PlayMode) => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center pb-1">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sld-accent)]">
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
          className="mode-selection-button mode-selection-button--competition flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl px-4 py-3 text-left transition active:scale-[.98]"
        >
          <span className="text-2xl" aria-hidden="true">
            🏆
          </span>
          <span className="block text-base font-black">Compétition</span>
          <span className="block text-[10px] font-medium text-tertiary">
            Marquez des points et visez le meilleur score
          </span>
        </button>

        <button
          type="button"
          onClick={() => onModeSelected("fun")}
          className="mode-selection-button mode-selection-button--fun flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl px-4 py-3 text-left transition active:scale-[.98]"
        >
          <span className="text-2xl" aria-hidden="true">
            🍺
          </span>
          <span className="block text-base font-black">Fun</span>
          <span className="block text-[10px] font-medium text-tertiary">
            Trouvez des réponses et distribuez des gorgées
          </span>
        </button>
      </div>
    </section>
  );
}
