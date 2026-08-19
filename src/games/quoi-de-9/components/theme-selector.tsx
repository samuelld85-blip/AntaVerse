"use client";

import { useThemeMode } from "@/lib/use-theme-mode";

export function ThemeSelector() {
  const { theme, selectTheme } = useThemeMode("light");

  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Apparence du jeu">
      {(
        [
          ["dark", "Mode sombre", "◐"],
          ["light", "Mode clair", "☀"],
        ] as const
      ).map(([value, label, icon]) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => selectTheme(value)}
            aria-pressed={selected}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition ${selected ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--accent-ink)]" : "border-subtle bg-[color:var(--surface-subtle)] text-secondary"}`}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
