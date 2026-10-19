"use client";

import { useLayoutEffect, type ReactNode } from "react";
import styles from "./sport.module.css";

/** A screen change starts at its heading; edits and timer ticks retain their position. */
export function SportView({ screen, children }: { screen: string; children: ReactNode }) {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [screen]);
  return <div className={styles.view}>{children}</div>;
}
