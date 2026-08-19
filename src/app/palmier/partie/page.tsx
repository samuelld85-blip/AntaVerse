import type { Metadata } from "next";
import { GameClient } from "@/games/palmier/features/game/game-client";

export const metadata: Metadata = { title: "Partie" };

export default function GamePage() {
  return <GameClient />;
}
