import type { Metadata } from "next";
import { GameClient } from "@/games/quoi-de-9/features/game/game-client";

export const metadata: Metadata = { title: "Partie" };

export default function GamePage() {
  return <GameClient />;
}
