import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/triman/styles.css";

export const metadata: Metadata = {
  title: { default: "Triman", template: "%s · Triman" },
  description:
    "2 dés, un Triman à trouver, des règles qui s’enchaînent. Le jeu de dés qui ne s’arrête jamais.",
};

export default function TrimanLayout({ children }: { children: ReactNode }) {
  return children;
}
