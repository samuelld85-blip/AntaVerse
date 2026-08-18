"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const themeKeys = [
  ["/quoi-de-9", "qui-des-9:theme"],
  ["/la-relance", "la-relance:theme"],
  ["/sans-le-dire", "sans-le-dire:theme"],
] as const;

export function RouteThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const gameKey = themeKeys.find(([prefix]) => pathname.startsWith(prefix))?.[1];
    const key = gameKey ?? "antaverse:theme";
    let theme = gameKey ? "light" : "dark";
    try {
      const storedTheme = window.localStorage.getItem(key);
      theme = storedTheme === "dark" ? "dark" : storedTheme === "light" ? "light" : theme;
    } catch {
      // Le thème sombre reste le repli lorsque le stockage est indisponible.
    }
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#F7F7F4" : "#0B1118");
  }, [pathname]);

  return null;
}
