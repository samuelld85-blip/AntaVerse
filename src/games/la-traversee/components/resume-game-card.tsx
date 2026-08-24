"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/la-traversee/lib/game/persistence";

export function ResumeGameCard() {
  return <SharedResumeGameCard load={loadCurrentGame} resumeHref="/la-traversee/partie" summary={(game) => `${game.players[game.currentPlayerIndex]?.name ?? "Joueur"} · manche ${game.roundsPlayed}`} />;
}
