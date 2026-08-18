"use client";

import { useSyncExternalStore } from "react";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "sans-le-dire:theme";
const THEME_CHANGE_EVENT = "sans-le-dire:theme-change";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    theme === "light" ? "#F7F7F4" : "#0B1118",
  );
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Le thème reste actif pour la session si le stockage est indisponible.
  }
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getThemeSnapshot(): ThemeMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

export function ThemeSelector() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function selectTheme(nextTheme: ThemeMode) {
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <div className="theme-selector" role="group" aria-label="Apparence du jeu">
      {([
        ["dark", "Mode sombre", "◐"],
        ["light", "Mode clair", "☀"],
      ] as const).map(([value, label, icon]) => {
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
