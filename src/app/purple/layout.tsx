import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/purple/styles.css";

export const metadata: Metadata = {
  title: { default: "Purple", template: "%s · Purple" },
  description:
    "Rouge, noir, Skubrum ou Sandwich : devinez les cartes, le pot grimpe, la partie ne s’arrête jamais.",
};

export default function PurpleLayout({ children }: { children: ReactNode }) {
  return children;
}
