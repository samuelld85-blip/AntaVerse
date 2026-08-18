"use client";

import { useThemeMode } from "@/lib/use-theme-mode";

export function HomeThemeSelector() {
  const { theme, selectTheme } = useThemeMode("dark");

  return (
    <div className="home-theme-selector" role="group" aria-label="Apparence d’AntaVerse">
      {(
        [
          ["light", "Mode clair", "☀"],
          ["dark", "Mode sombre", "◐"],
        ] as const
      ).map(([value, label, icon]) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => selectTheme(value)}
            aria-pressed={selected}
            className={selected ? "home-theme-button is-selected" : "home-theme-button"}
          >
            <span aria-hidden="true">{icon}</span>
            <span className="home-theme-label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
