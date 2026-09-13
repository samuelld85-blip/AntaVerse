import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/ethnoguessr/styles.css";

export const metadata: Metadata = {
  title: { default: "EthnoGuessr", template: "%s · EthnoGuessr" },
  description:
    "Observe le duo, place ta réponse sur la carte du monde et devine sa zone géographique d'origine.",
};

export default function EthnoGuessrLayout({ children }: { children: ReactNode }) {
  return children;
}
