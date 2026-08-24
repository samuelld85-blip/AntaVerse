"use client";

export function FormatSelectionScreen({
  onTeams,
  onSolo,
}: {
  onTeams: () => void;
  onSolo: () => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center pb-1">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sld-accent)]">
          Choisissez votre format
        </p>
        <h1 className="display-face balance mt-2.5 text-[clamp(2rem,8vw,2.8rem)] leading-[0.88]">
          Équipes ou Individuel ?
        </h1>
      </div>

      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={onTeams}
          className="mode-selection-button mode-selection-button--teams flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl px-4 py-3 text-left transition active:scale-[.98]"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              👥
            </span>
            <span className="text-base font-black">Équipes</span>
          </div>
          <span className="block text-[10px] font-medium text-tertiary">
            Faites deviner les mots à votre équipe
          </span>
        </button>

        <button
          type="button"
          onClick={onSolo}
          className="mode-selection-button mode-selection-button--solo flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl px-4 py-3 text-left transition active:scale-[.98]"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              🎯
            </span>
            <span className="text-base font-black">Individuel</span>
          </div>
          <span className="block text-[10px] font-medium text-tertiary">
            Un joueur fait deviner, tous les autres s’affrontent
          </span>
        </button>
      </div>
    </section>
  );
}
