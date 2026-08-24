"use client";

import { ResumeGameCard as SharedResumeGameCard } from "@/games/shared/components/resume-game-card";
import { loadCurrentGame } from "@/games/pmu/lib/game/persistence";

export function ResumeGameCard() {
  return <SharedResumeGameCard load={loadCurrentGame} resumeHref="/pmu/partie" summary={(game) => game.phase === "betting" ? `Mise de ${game.players[game.currentPlayerIndex]?.name ?? "Joueur"}` : game.winnerSuit ? "Course terminée" : `${game.remainingDeck.length} cartes dans la pioche`} />;
}
