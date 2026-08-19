import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/palmier/styles.css";

export const metadata: Metadata = {
  title: { default: "Palmier", template: "%s · Palmier" },
  description:
    "Secouez le palmier, distribuez les gorgées, et fuyez la chute — tôt ou tard, il tombe.",
};

export default function PalmierLayout({ children }: { children: ReactNode }) {
  return children;
}
