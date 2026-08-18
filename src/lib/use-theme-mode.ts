"use client";

import { useSyncExternalStore } from "react";

// Theme (light/dark) is an AntaVerse-wide setting, not a per-game concern:
// it lives in one localStorage key ("antaverse:theme") shared by the launcher
// and every game. This hook is the single source of truth for that state;
// each screen keeps its own presentational selector component (they render
// very differently — Tailwind vs hand-written CSS — but all read/write the
// same theme through this hook instead of re-implementing the sync logic.

export type ThemeMode = "dark" | "light";

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

/**
 * @param serverSnapshot value to render before hydration (must match what each
 * screen already renders server-side to avoid a hydration mismatch — the
 * launcher defaults to "dark", game screens default to "light").
 */
export function useThemeMode(serverSnapshot: ThemeMode) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => serverSnapshot);

  function selectTheme(nextTheme: ThemeMode) {
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return { theme, selectTheme };
}
