import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/bac-enchaine/styles.css";

export const metadata: Metadata = {
  title: { default: "Bac Enchaîné", template: "%s · Bac Enchaîné" },
  description: "Le Petit Bac en chaîne, rapide et collectif, avec un seul téléphone.",
};

export default function BacEnchaineLayout({ children }: { children: ReactNode }) {
  return children;
}
