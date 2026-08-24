"use client";

import { useSyncExternalStore } from "react";

// Theme (light/dark) is an AntaVerse-wide, session-only setting, not a
// per-game concern. The app starts dark on every load; this hook is the single
// source of truth for the theme while the app is open. Each screen keeps its
// own presentational selector component, but all read/write the same theme
// through this hook instead of re-implementing the sync logic.

export type ThemeMode = "dark" | "light";

const THEME_CHANGE_EVENT = "antaverse:theme-change";

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "light" ? "#F7F7F4" : "#0B1118");
}

function subscribeToTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getThemeSnapshot(): ThemeMode {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/**
 * @param serverSnapshot value to render before hydration. Every app screen
 * defaults to dark; the light theme is only activated by an explicit click.
 */
export function useThemeMode(serverSnapshot: ThemeMode) {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => serverSnapshot);

  function selectTheme(nextTheme: ThemeMode) {
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return { theme, selectTheme };
}
