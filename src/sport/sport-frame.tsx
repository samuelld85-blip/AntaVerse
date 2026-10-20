"use client";

import type { ReactNode } from "react";
import { useThemeMode } from "@/lib/use-theme-mode";
import styles from "./sport.module.css";

/** Keeps Sport's visual foundations local to its routes, including account states. */
export function SportFrame({ children }: { children: ReactNode }) {
  const { theme } = useThemeMode("dark");
  return (
    <div className={styles.frame} data-theme={theme}>
      {children}
    </div>
  );
}
