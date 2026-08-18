import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/roulette-du-chaos/styles.css";

export const metadata: Metadata = {
  title: { default: "Roulette du Chaos", template: "%s · Roulette du Chaos" },
  description:
    "Tournez la roue, tombez sur un événement, un duel ou un jackpot : le party game qui ne se répète jamais deux fois.",
};

export default function RouletteDuChaosLayout({ children }: { children: ReactNode }) {
  return children;
}
