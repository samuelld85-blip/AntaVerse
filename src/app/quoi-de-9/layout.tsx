import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/quoi-de-9/styles.css";

export const metadata: Metadata = {
  title: { default: "Quoi de 9 ?", template: "%s · Quoi de 9 ?" },
  description: "Le quiz à neuf réponses pour vos soirées entre amis.",
};

export default function QuoiDe9Layout({ children }: { children: ReactNode }) {
  return children;
}
