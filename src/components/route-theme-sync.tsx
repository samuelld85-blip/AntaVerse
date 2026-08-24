"use client";

import { useEffect } from "react";

export function RouteThemeSync() {
  useEffect(() => {
    // The theme is deliberately not persisted: every fresh app load starts
    // in dark mode, regardless of a previous choice or browser.
    document.documentElement.dataset.theme = "dark";
    try {
      // Remove the legacy key so an older installation cannot retain a stale
      // preference, even though current code no longer reads it.
      window.localStorage.removeItem("antaverse:theme");
    } catch {
      // Le thème sombre reste actif si le stockage est indisponible.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#0B1118");
  }, []);

  return null;
}
