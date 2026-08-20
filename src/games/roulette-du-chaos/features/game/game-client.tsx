"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/games/shared/components/back-button";
import { Brand } from "@/games/roulette-du-chaos/components/brand";
import { EventCard } from "@/games/roulette-du-chaos/components/event-card";
import { MiniGameRouter } from "@/games/roulette-du-chaos/components/mini-games/mini-game-router";
import { RuleBanner } from "@/games/roulette-du-chaos/components/rule-banner";
import { Wheel } from "@/games/roulette-du-chaos/components/wheel";
import {
  clearActiveRule,
  completeMiniGame,
  completeTurn,
  finishSpin,
  getActivePlayer,
  replayGame,
  revealEvent,
  spinWheel,
  submitChoice,
  submitMysteryPick,
  submitReveal,
  submitNeighbor,
  submitTargets,
} from "@/games/roulette-du-chaos/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/roulette-du-chaos/lib/game/persistence";
import { getCategory } from "@/games/roulette-du-chaos/lib/game/wheel";
import type { GameState, MiniGameOutcome } from "@/games/roulette-du-chaos/lib/game/types";

const CATEGORY_REVEAL_MS = 900;
const WHEEL_PHASES = new Set<GameState["phase"]>(["idle", "spinning", "categoryReveal"]);

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/roulette-du-chaos/joueurs");
        return;
      }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  function spin() {
    if (!game || busy.current || game.phase !== "idle") return;
    busy.current = true;
    commit(spinWheel(game));
  }

  function onSpinEnd() {
    if (!game || game.phase !== "spinning") return;
    const revealed = finishSpin(game);
    commit(revealed);
    window.setTimeout(() => {
      commit(revealEvent(revealed));
      busy.current = false;
    }, CATEGORY_REVEAL_MS);
  }

  function restart() {
    if (!game) return;
    if (!window.confirm("Recommencer une nouvelle partie avec les mêmes joueurs ?")) return;
    commit(replayGame(game));
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell rdc-shell rdc-loading" aria-busy="true">
        <Brand compact />
        <p>Préparation de la roue…</p>
      </main>
    );
  }

  const activePlayer = getActivePlayer(game);
  const category = game.selectedCategory ? getCategory(game.selectedCategory) : null;

  return (
    <main className="game-shell safe-shell rdc-shell">
      <header className="game-header">
        <BackButton homeHref="/roulette-du-chaos" />
        <Brand compact />
        <button
          type="button"
          className="restart-button"
          onClick={restart}
          aria-label="Nouvelle partie"
        >
          <span aria-hidden="true">↻</span>
        </button>
      </header>

      {game.activeRule ? (
        <RuleBanner
          key={game.activeRule.ruleId}
          rule={game.activeRule}
          ownerName={
            game.players.find((p) => p.id === game.activeRule!.ownerId)?.name ?? "Joueur inconnu"
          }
          onClear={() => commit(clearActiveRule(game))}
        />
      ) : null}

      {WHEEL_PHASES.has(game.phase) ? (
        <section className="wheel-stage">
          <p className="current-player-label">Au tour de</p>
          <h1 className="current-player-name">{activePlayer.name}</h1>
          <Wheel
            targetCategory={game.selectedCategory}
            spinning={game.phase === "spinning"}
            onSpinEnd={onSpinEnd}
          />
          {game.phase === "categoryReveal" && category ? (
            <div className="category-badge" aria-live="polite">
              <span aria-hidden="true">{category.icon}</span> {category.label}
            </div>
          ) : (
            <button
              type="button"
              className="button button--primary"
              onClick={spin}
              disabled={game.phase !== "idle"}
            >
              {game.phase === "spinning" ? "…" : "Tourner la roue"}
            </button>
          )}
        </section>
      ) : null}

      {game.phase === "event" ? (
        <EventCard
          game={game}
          onSubmitTargets={(ids) => commit(submitTargets(game, ids))}
          onSubmitNeighbor={(side) => commit(submitNeighbor(game, side))}
          onSubmitChoice={(key) => commit(submitChoice(game, key))}
          onSubmitMysteryPick={(index) => commit(submitMysteryPick(game, index))}
          onReveal={() => commit(submitReveal(game))}
          onContinue={() => commit(completeTurn(game))}
        />
      ) : null}

      {game.phase === "miniGame" ? (
        <MiniGameRouter
          game={game}
          onComplete={(outcome: MiniGameOutcome) => commit(completeMiniGame(game, outcome))}
        />
      ) : null}
    </main>
  );
}
