"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const key = "antaverse:theme";
    let theme = "dark";
    try {
      const storedTheme = window.localStorage.getItem(key);
      theme = storedTheme === "dark" ? "dark" : storedTheme === "light" ? "light" : theme;
    } catch {
      // Le thème clair reste le repli lorsque le stockage est indisponible.
    }
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#F7F7F4" : "#0B1118");
  }, [pathname]);

  return null;
}
