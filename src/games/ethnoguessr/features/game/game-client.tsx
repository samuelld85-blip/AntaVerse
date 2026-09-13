"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/games/ethnoguessr/components/brand";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { getDuo } from "@/games/ethnoguessr/data/duos";
import {
  createGame,
  currentDuoId,
  nextRound,
  ROUND_COUNT,
  startGuessing,
  submitGuess,
} from "@/games/ethnoguessr/lib/game/engine";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "@/games/ethnoguessr/lib/game/persistence";
import type { GameState, RoundGuess } from "@/games/ethnoguessr/lib/game/types";
import { PhotoScreen } from "./photo-screen";
import { MapScreen } from "./map-screen";
import { ResultScreen } from "./result-screen";
import { EndScreen } from "./end-screen";

export function GameClient() {
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setGame(loadCurrentGame() ?? createGame());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const duo = game ? getDuo(currentDuoId(game)) : undefined;

  if (ready && game && !duo) {
    // A saved game can outlive a regenerated content pool (a duo id it
    // references no longer exists). Recover synchronously during render —
    // React's sanctioned pattern for adjusting state from a derived value —
    // rather than in an effect, which would first commit one stale frame.
    clearCurrentGame();
    const fresh = createGame();
    saveCurrentGame(fresh);
    setGame(fresh);
  }

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  function replay() {
    clearCurrentGame();
    commit(createGame());
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell eg-shell eg-loading" aria-busy="true">
        <Brand compact />
        <p>On prépare la carte…</p>
      </main>
    );
  }

  if (game.status === "completed") {
    return <EndScreen game={game} onReplay={replay} />;
  }

  if (!duo) {
    return (
      <main className="game-shell safe-shell eg-shell eg-loading" aria-busy="true">
        <Brand compact />
        <p>On actualise la partie…</p>
      </main>
    );
  }

  const roundNumber = game.currentRoundIndex + 1;
  const lastOutcome = game.outcomes[game.outcomes.length - 1];

  return (
    <main className="game-shell safe-shell eg-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/ethnoguessr" />
      </header>

      {game.phase === "viewing" ? (
        <PhotoScreen
          manSrc={duo.man.imageSrc}
          womanSrc={duo.woman.imageSrc}
          roundNumber={roundNumber}
          totalRounds={ROUND_COUNT}
          onReady={() => commit(startGuessing(game))}
        />
      ) : null}

      {game.phase === "guessing" ? (
        <MapScreen
          manSrc={duo.man.imageSrc}
          womanSrc={duo.woman.imageSrc}
          roundNumber={roundNumber}
          totalRounds={ROUND_COUNT}
          onSubmit={(guess: RoundGuess) => commit(submitGuess(game, guess))}
        />
      ) : null}

      {game.phase === "result" && lastOutcome ? (
        <ResultScreen
          outcome={lastOutcome}
          roundNumber={roundNumber}
          totalRounds={ROUND_COUNT}
          isLastRound={roundNumber >= ROUND_COUNT}
          onNext={() => commit(nextRound(game))}
        />
      ) : null}
    </main>
  );
}
