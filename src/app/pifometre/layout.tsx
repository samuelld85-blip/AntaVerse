import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/pifometre/styles.css";

export const metadata: Metadata = {
  title: { default: "Le Pifomètre", template: "%s · Le Pifomètre" },
  description: "Estimez. Révélez. Distribuez les points.",
};

export default function PifometreLayout({ children }: { children: ReactNode }) {
  return children;
}
