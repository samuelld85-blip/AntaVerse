import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/interpol/styles.css";

export const metadata: Metadata = {
  title: { default: "Interpol", template: "%s · Interpol" },
  description: "Le maître du jeu connaît la charge, les autres questionnent et proposent à l'oral.",
};

export default function InterpolLayout({ children }: { children: ReactNode }) {
  return children;
}
