"use client";

import { useSyncExternalStore } from "react";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "antaverse:theme";
const THEME_CHANGE_EVENT = "antaverse:theme-change";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#F7F7F4" : "#0B1118");
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

export function HomeThemeSelector() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");

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
            onClick={() => {
              applyTheme(value);
              window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
            }}
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
