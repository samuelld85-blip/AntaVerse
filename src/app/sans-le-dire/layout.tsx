import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/sans-le-dire/styles.css";

export const metadata: Metadata = {
  title: { default: "Sans le dire", template: "%s · Sans le dire" },
  description: "Fais deviner le mot sans prononcer les trois mots interdits.",
};

export default function SansLeDireLayout({ children }: { children: ReactNode }) {
  return children;
}
