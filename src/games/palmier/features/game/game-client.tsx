"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/games/shared/components/back-button";
import { Brand } from "@/games/palmier/components/brand";
import { CardReveal } from "@/games/palmier/components/card-reveal";
import { PalmTree } from "@/games/palmier/components/palm-tree";
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

const SHAKE_REVEAL_MS = 550;
const COLLAPSE_ANIM_MS = 1900;

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [collapseAnimating, setCollapseAnimating] = useState(false);
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

  function shakeAndDraw() {
    if (!game || busy.current || game.phase !== "idle") return;
    busy.current = true;
    setRevealing(true);
    window.setTimeout(() => {
      const next = drawCard(game);
      commit(next);
      setRevealing(false);
      busy.current = false;
      if (next.phase === "collapse") {
        setCollapseAnimating(true);
        window.setTimeout(() => setCollapseAnimating(false), COLLAPSE_ANIM_MS);
      }
    }, SHAKE_REVEAL_MS);
  }

  function onContinue() {
    if (!game) return;
    if (game.phase === "collapse") {
      commit(completeCollapse(game));
    } else {
      commit(completeTurn(game));
    }
  }

  function restart() {
    if (!game) return;
    if (!window.confirm("Recommencer une nouvelle partie avec les mêmes joueurs ?")) return;
    setCollapseAnimating(false);
    setRevealing(false);
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
          <BackButton homeHref="/palmier" />
          <Brand compact />
          <div style={{ width: "2.4rem" }} />
        </header>
        <section className="palm-stage">
          <PalmTree stage="stable" />
          <div className="game-end-card">
            <p className="game-end-icon" aria-hidden="true">🌴</p>
            <h1 className="game-end-title">Le palmier est vide</h1>
            <p className="game-end-subtitle">Vous avez tiré les 52 cartes.</p>
            <div className="game-end-actions">
              <button type="button" className="shake-button" onClick={restart}>
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
  // After the 4th king collapse has been shown, show stable palm (no more kings possible)
  const palmStage =
    game.kingsDrawn < 4 || game.phase === "collapse"
      ? palmStageForKings(game.kingsDrawn)
      : "stable";
  const isCollapsing = game.phase === "collapse" && collapseAnimating;
  const cardsLeft = game.remainingDeck.length;

  return (
    <main className="game-shell safe-shell plm-shell">
      <header className="game-header">
        <BackButton homeHref="/palmier" />
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

      {game.phase === "idle" ? (
        <section className="palm-stage">
          <p className="current-player-label">Au tour de</p>
          <h1 className="current-player-name">{activePlayer.name}</h1>
          <PalmTree stage={palmStage} />
          <button
            type="button"
            className="shake-button"
            onClick={shakeAndDraw}
            disabled={revealing}
            data-shaking={revealing}
          >
            {revealing ? "…" : "Secoue le palmier"}
          </button>
          <p className="cards-remaining">
            {cardsLeft} carte{cardsLeft !== 1 ? "s" : ""} restante{cardsLeft !== 1 ? "s" : ""}
          </p>
          {game.maitrePouce || game.maitreQuestions ? (
            <div className="maitre-bar">
              {game.maitrePouce ? (
                <span className="maitre-chip">👍 Maître du pouce : {game.maitrePouce}</span>
              ) : null}
              {game.maitreQuestions ? (
                <span className="maitre-chip">❓ Maître des questions : {game.maitreQuestions}</span>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {(game.phase === "reveal" || (game.phase === "collapse" && !collapseAnimating)) ? (
        <CardReveal game={game} onContinue={onContinue} />
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
