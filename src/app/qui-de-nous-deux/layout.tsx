import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/qui-de-nous-deux/styles.css";

export const metadata: Metadata = {
  title: { default: "Qui de nous deux ?", template: "%s · Qui de nous deux ?" },
  description: "Deux personnes, une question, une réponse qui peut tout changer.",
};

export default function QuiDeNousDeuxLayout({ children }: { children: ReactNode }) {
  return children;
}
