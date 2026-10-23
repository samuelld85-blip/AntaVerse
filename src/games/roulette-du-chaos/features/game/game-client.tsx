"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Brand } from "@/games/roulette-du-chaos/components/brand";
import { EventCard } from "@/games/roulette-du-chaos/components/event-card";
import {
  CursedObjectPanel,
  CursedRevealCard,
} from "@/games/roulette-du-chaos/components/cursed-object-panel";
import { MiniGameRouter } from "@/games/roulette-du-chaos/components/mini-games/mini-game-router";
import { RuleStack } from "@/games/roulette-du-chaos/components/rule-banner";
import {
  SecretChallengeHub,
  SecretRevealCard,
} from "@/games/roulette-du-chaos/components/secret-challenge-hub";
import { Wheel } from "@/games/roulette-du-chaos/components/wheel";
import {
  clearActiveRule,
  completeMiniGame,
  completeTurn,
  dismissSecretReveal,
  dismissCursedReveal,
  finishSpin,
  getActivePlayer,
  getDisplayPlayers,
  revealEvent,
  resolveSecretChallenge,
  resolveCursedObject,
  spinWheel,
  submitChoice,
  submitMysteryPick,
  submitReveal,
  submitSecretAccepted,
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

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell rdc-shell rdc-loading" aria-busy="true">
        <Brand compact />
        <p>Préparation de la roue…</p>
      </main>
    );
  }

  const activePlayer = getActivePlayer(game);
  const displayPlayers = getDisplayPlayers(game);
  const activeDisplayName = displayPlayers[game.activePlayerIndex]?.name ?? activePlayer.name;
  const cursedObjectDue = game.cursedObjects.some((object) => object.dueTurn <= game.turnNumber);
  const category = game.selectedCategory ? getCategory(game.selectedCategory) : null;

  return (
    <main className="game-shell safe-shell rdc-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/roulette-du-chaos" />
      </header>

      <RuleStack
        rules={game.activeRules}
        players={game.players}
        turnNumber={game.turnNumber}
        onClear={(instanceId) => commit(clearActiveRule(game, instanceId))}
      />

      {game.phase === "idle" && !game.secretReveal ? (
        <SecretChallengeHub
          challenges={game.secretChallenges}
          players={game.players}
          onResolve={(instanceId, success) =>
            commit(resolveSecretChallenge(game, instanceId, success))
          }
        />
      ) : null}
      {game.phase === "idle" && !game.secretReveal && !game.cursedReveal ? (
        <CursedObjectPanel
          objects={game.cursedObjects}
          turnNumber={game.turnNumber}
          players={game.players}
          onResolve={(instanceId, holderId) =>
            commit(resolveCursedObject(game, instanceId, holderId))
          }
        />
      ) : null}

      {game.secretReveal ? (
        <SecretRevealCard
          reveal={game.secretReveal}
          players={game.players}
          onContinue={() => commit(dismissSecretReveal(game))}
        />
      ) : null}
      {game.cursedReveal ? (
        <CursedRevealCard
          reveal={game.cursedReveal}
          players={game.players}
          onContinue={() => commit(dismissCursedReveal(game))}
        />
      ) : null}

      {WHEEL_PHASES.has(game.phase) &&
      !game.secretReveal &&
      !game.cursedReveal &&
      !cursedObjectDue ? (
        <section className="wheel-stage">
          <p className="current-player-label">Au tour de</p>
          <h1 className="current-player-name">{activeDisplayName}</h1>
          {activeDisplayName !== activePlayer.name ? (
            <p className="current-player-alias">En vrai : {activePlayer.name}</p>
          ) : null}
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

      {game.phase === "event" && !game.secretReveal ? (
        <EventCard
          game={{ ...game, players: displayPlayers }}
          onSubmitTargets={(ids) => commit(submitTargets(game, ids))}
          onSubmitNeighbor={(side) => commit(submitNeighbor(game, side))}
          onSubmitChoice={(key) => commit(submitChoice(game, key))}
          onSubmitMysteryPick={(index) => commit(submitMysteryPick(game, index))}
          onReveal={() => commit(submitReveal(game))}
          onSecretAccepted={() => commit(submitSecretAccepted(game))}
          onContinue={() => commit(completeTurn(game))}
        />
      ) : null}

      {game.phase === "miniGame" && !game.secretReveal ? (
        <MiniGameRouter
          game={{ ...game, players: displayPlayers }}
          onComplete={(outcome: MiniGameOutcome) => commit(completeMiniGame(game, outcome))}
        />
      ) : null}
    </main>
  );
}
