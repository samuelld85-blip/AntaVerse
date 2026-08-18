import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/la-relance/styles.css";

export const metadata: Metadata = {
  title: { default: "La Relance", template: "%s · La Relance" },
  description: "Un thème, deux équipes, une réponse chacun. Jusqu’à ce que l’un craque.",
};

export default function LaRelanceLayout({ children }: { children: ReactNode }) {
  return children;
}
