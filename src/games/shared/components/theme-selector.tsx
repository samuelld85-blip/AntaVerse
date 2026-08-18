"use client";

import { useThemeMode } from "@/lib/use-theme-mode";

export function ThemeSelector() {
  const { theme, selectTheme } = useThemeMode("light");

  return (
    <div className="theme-selector" role="group" aria-label="Apparence du jeu">
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
            className={selected ? "theme-selector-button is-selected" : "theme-selector-button"}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
