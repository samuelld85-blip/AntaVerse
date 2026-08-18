"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/games/shared/components/back-button";
import { Brand } from "@/games/purple/components/brand";
import { PlayingCard } from "@/games/purple/components/playing-card";
import { GUESS_DRAW_COUNT, canPass, passTurn, submitGuess } from "@/games/purple/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/purple/lib/game/persistence";
import type { GameState, GuessType } from "@/games/purple/lib/game/types";

const GUESS_ORDER: readonly GuessType[] = ["red", "black", "purple", "doublePurple", "skubrum"];

const GUESS_LABEL: Record<GuessType, string> = {
  red: "Rouge",
  black: "Noir",
  purple: "Violet",
  doublePurple: "Double violet",
  skubrum: "Skubrum",
};

const REVEAL_BASE_MS = 560;
const REVEAL_STAGGER_MS = 90;
const REVEAL_BUFFER_MS = 220;

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealGame, setRevealGame] = useState<GameState | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/purple/joueurs");
        return;
      }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function act(guessType: GuessType) {
    if (!game || busy.current) return;
    busy.current = true;
    const next = submitGuess(game, guessType);
    setRevealGame(next);
    setRevealing(true);
    setRoundKey((key) => key + 1);
    feedback(next.lastGuess?.outcome === "success" ? "success" : "failure");

    const cardCount = next.lastGuess?.cards.length ?? 1;
    const revealMs = REVEAL_BASE_MS + cardCount * REVEAL_STAGGER_MS + REVEAL_BUFFER_MS;
    window.setTimeout(() => {
      saveCurrentGame(next);
      setGame(next);
      setRevealing(false);
      busy.current = false;
    }, revealMs);
  }

  function pass() {
    if (!game || busy.current || !canPass(game)) return;
    const next = passTurn(game);
    saveCurrentGame(next);
    setGame(next);
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <Brand />
        <p>Préparation du paquet…</p>
      </main>
    );
  }

  const displayGame = revealing && revealGame ? revealGame : game;
  const currentPlayer = game.players[game.currentPlayerIndex];
  const lastGuess = displayGame.lastGuess;
  const passAllowed = !revealing && canPass(game);

  return (
    <main className="purple-shell safe-shell">
      <header className="purple-header">
        <BackButton homeHref="/purple" />
        <div className="purple-turn">
          <span className="purple-turn-label">Au tour de</span>
          <span className="purple-turn-name">{currentPlayer?.name}</span>
        </div>
      </header>

      <section className="purple-stats" aria-label="État de la partie">
        <div className="purple-stat purple-stat--pile">
          <span className="purple-stat-label">Pot commun</span>
          <strong className="purple-stat-value">{game.pile}</strong>
        </div>
        <div className="purple-stat">
          <span className="purple-stat-label">Manche</span>
          <strong className="purple-stat-value">{game.progress}</strong>
          <span
            className={
              canPass(game) ? "purple-stat-hint purple-stat-hint--ready" : "purple-stat-hint"
            }
          >
            {canPass(game) ? "Peut passer" : "3 pour passer"}
          </span>
        </div>
        <div className="purple-stat">
          <span className="purple-stat-label">Paquet</span>
          <strong className="purple-stat-value">{game.deck.length}</strong>
          <span className="purple-stat-hint">cartes</span>
        </div>
      </section>

      <section className="purple-stage" aria-live="polite">
        {lastGuess ? (
          <>
            <div className="cards-reveal-row" key={roundKey}>
              {lastGuess.cards.map((card, index) => (
                <PlayingCard card={card} index={index} key={card.id} />
              ))}
            </div>
            {!revealing ? (
              <div
                className={
                  lastGuess.outcome === "success"
                    ? "purple-result purple-result--success"
                    : "purple-result purple-result--failure"
                }
              >
                <p className="purple-result-outcome">
                  {lastGuess.outcome === "success" ? "Réussi" : "Échoué"}
                </p>
                <h1 className="purple-result-headline">
                  {lastGuess.outcome === "success"
                    ? `${GUESS_LABEL[lastGuess.guessType]} !`
                    : GUESS_LABEL[lastGuess.guessType]}
                </h1>
                <p className="purple-result-detail">
                  {lastGuess.outcome === "success"
                    ? `+${lastGuess.sipsAdded} ${sipsWord(lastGuess.sipsAdded)} dans le pot`
                    : `${currentPlayer?.name} boit ${lastGuess.sipsDrunk} ${sipsWord(lastGuess.sipsDrunk)}`}
                </p>
              </div>
            ) : null}
            {!revealing && lastGuess.reshuffled ? (
              <p className="purple-reshuffle-pill">Nouveau paquet mélangé</p>
            ) : null}
          </>
        ) : (
          <div className="purple-idle">
            <p>Choisissez une carte à deviner.</p>
          </div>
        )}
      </section>

      <section className="purple-actions">
        <div className="guess-grid" role="group" aria-label="Choix de la carte">
          {GUESS_ORDER.map((guessType) => (
            <button
              key={guessType}
              type="button"
              className={`guess-button guess-button--${guessType}`}
              onClick={() => act(guessType)}
              disabled={revealing}
            >
              <span className="guess-button-label">{GUESS_LABEL[guessType]}</span>
              <span className="guess-button-draw">
                {GUESS_DRAW_COUNT[guessType]} carte{GUESS_DRAW_COUNT[guessType] > 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
        {passAllowed ? (
          <button type="button" className="pass-button" onClick={pass}>
            Passer la main <span aria-hidden="true">→</span>
          </button>
        ) : null}
      </section>
    </main>
  );
}

function sipsWord(count: number): string {
  return count === 1 ? "gorgée" : "gorgées";
}

function feedback(kind: "success" | "failure") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(kind === "success" ? 30 : [50, 40, 90]);
  }
}
