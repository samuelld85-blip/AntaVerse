"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuitGameButton } from "@/games/shared/components/quit-game-button";
import { Brand } from "@/games/palmier/components/brand";
import { CardReveal } from "@/games/palmier/components/card-reveal";
import { PalmTree } from "@/games/palmier/components/palm-tree";
import { PalmierGoalMiniGame } from "@/games/palmier/components/goal-mini-game";
import {
  completeCollapse,
  completeTurn,
  drawCard,
  getActivePlayer,
  palmStageForKings,
  replayGame,
} from "@/games/palmier/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/palmier/lib/game/persistence";
import type { GameState } from "@/games/palmier/lib/game/types";

const COLLAPSE_ANIM_MS = 1900;
const TOTAL_CARDS = 52;

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [collapseAnimating, setCollapseAnimating] = useState(false);
  // penalty sips added by the mini-game before card reveal
  const [penaltySips, setPenaltySips] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/palmier/joueurs");
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

  // Called by the mini-game when the player releases the card.
  // failed=true → 1 penalty sip, then draw anyway.
  function onMiniGameResolved(failed: boolean) {
    if (!game || busy.current) return;
    busy.current = true;
    setPenaltySips(failed ? 1 : 0);
    const next = drawCard(game);
    commit(next);
    busy.current = false;
    if (next.phase === "collapse") {
      setCollapseAnimating(true);
      window.setTimeout(() => setCollapseAnimating(false), COLLAPSE_ANIM_MS);
    }
  }

  function onContinue() {
    if (!game) return;
    setPenaltySips(0);
    if (game.phase === "collapse") {
      commit(completeCollapse(game));
    } else {
      commit(completeTurn(game));
    }
  }

  function restart() {
    if (!game) return;
    setCollapseAnimating(false);
    setPenaltySips(0);
    busy.current = false;
    commit(replayGame(game));
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell plm-shell plm-loading" aria-busy="true">
        <Brand compact />
        <p>On plante le palmier…</p>
      </main>
    );
  }

  if (game.phase === "end") {
    return (
      <main className="game-shell safe-shell plm-shell">
        <header className="game-header">
          {/* No exit control here: the end card below already offers Rejouer
              and Quitter as this screen's primary actions. */}
          <Brand compact />
        </header>
        <section className="palm-stage">
          <PalmTree stage="stable" />
          <div className="game-end-card">
            <p className="game-end-icon" aria-hidden="true">🌴</p>
            <h1 className="game-end-title">Le palmier est vide</h1>
            <p className="game-end-subtitle">Vous avez tiré les 52 cartes.</p>
            <div className="game-end-actions">
              <button type="button" className="button button--primary" onClick={restart}>
                Rejouer <span aria-hidden="true">↻</span>
              </button>
              <button
                type="button"
                className="game-end-quit"
                onClick={() => router.push("/palmier")}
              >
                Quitter
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const activePlayer = getActivePlayer(game);
  const palmStage =
    game.kingsDrawn < 4 || game.phase === "collapse"
      ? palmStageForKings(game.kingsDrawn)
      : "stable";
  const isCollapsing = game.phase === "collapse" && collapseAnimating;
  const cardsLeft = game.remainingDeck.length;

  return (
    <main className="game-shell safe-shell plm-shell">
      <header className="game-header">
        <Brand compact />
        <QuitGameButton homeHref="/palmier" />
      </header>

      {game.phase === "idle" ? (
        <PalmierGoalMiniGame
          totalCards={TOTAL_CARDS}
          remainingCards={cardsLeft}
          playerName={activePlayer.name}
          cardsLeft={cardsLeft}
          maitrePouce={game.maitrePouce}
          maitreQuestions={game.maitreQuestions}
          onResolved={onMiniGameResolved}
        />
      ) : null}

      {(game.phase === "reveal" || (game.phase === "collapse" && !collapseAnimating)) ? (
        <CardReveal game={game} penaltySips={penaltySips} onContinue={onContinue} />
      ) : null}

      {isCollapsing ? (
        <section className="palm-stage palm-stage--collapse">
          <p className="collapse-warning">Le palmier tombe…</p>
          <PalmTree stage="critical" collapsing />
        </section>
      ) : null}
    </main>
  );
}
