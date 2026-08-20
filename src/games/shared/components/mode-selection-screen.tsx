"use client";

interface ModeOption {
  id: string;
  label: string;
  description: string;
  emoji: string;
  accentVar: string;
}

export function ModeSelectionScreen({
  title,
  subtitle,
  modes,
  onModeSelected,
}: {
  title: string;
  subtitle: string;
  modes: ModeOption[];
  onModeSelected: (modeId: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center pb-1">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--sld-accent)]">
          {subtitle}
        </p>
        <h1 className="display-face balance mt-2.5 text-[clamp(2rem,8vw,2.8rem)] leading-[0.88]">
          {title}
        </h1>
      </div>

      <div className="mt-8 grid gap-3">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onModeSelected(mode.id)}
            className={`mode-selection-button mode-selection-button--${mode.id} flex min-h-20 flex-col items-start justify-center gap-1.5 rounded-2xl px-4 py-3 text-left transition active:scale-[.98]`}
            style={{ "--accent-var": `var(${mode.accentVar})` } as React.CSSProperties}
          >
            <span className="text-2xl" aria-hidden="true">
              {mode.emoji}
            </span>
            <span className="block text-base font-black">{mode.label}</span>
            <span className="block text-[10px] font-medium text-tertiary">
              {mode.description}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
