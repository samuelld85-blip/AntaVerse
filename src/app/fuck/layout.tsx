import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/fuck/styles.css";

export const metadata: Metadata = {
  title: { default: "Fuck", template: "%s · Fuck" },
  description: "Devinez la carte, gérez le pot et gardez le Dealer trois manches d’affilée.",
};

export default function FuckLayout({ children }: { children: ReactNode }) {
  return children;
}
