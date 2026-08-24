import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/games/shared/game-base.css";
import "@/games/pmu/styles.css";

export const metadata: Metadata = { title: { default: "PMU", template: "%s · PMU" }, description: "Misez sur un cheval, retournez les checkpoints et gagnez la course." };

export default function PmuLayout({ children }: { children: ReactNode }) { return children; }
