import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/la-traversee/styles.css";

export const metadata: Metadata = { title: { default: "La Traversée", template: "%s · La Traversée" }, description: "Traversez les lignes de cartes sans vous tromper de direction." };

export default function LaTraverseeLayout({ children }: { children: ReactNode }) { return children; }
