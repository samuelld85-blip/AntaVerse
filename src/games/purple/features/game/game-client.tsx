"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/games/shared/components/back-button";
import { Brand } from "@/games/purple/components/brand";
import { PlayingCard } from "@/games/purple/components/playing-card";
import { MiniCard } from "@/games/purple/components/mini-card";
import type { Card } from "@/games/purple/lib/game/types";
import { canPass, canPlayHigherLower, passTurn, submitGuess } from "@/games/purple/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/purple/lib/game/persistence";
import type { GameState, GuessType } from "@/games/purple/lib/game/types";

const GUESS_ORDER: readonly GuessType[] = [
  "lower",
  "higher",
  "red",
  "black",
  "purple",
  "doublePurple",
  "skubrum",
  "sandwich",
];

const GUESS_LABEL: Record<GuessType, string> = {
  red: "Rouge",
  black: "Noir",
  purple: "Purple",
  doublePurple: "Double Purple",
  skubrum: "Skubrum",
  sandwich: "Sandwich",
  higher: "Plus",
  lower: "Moins",
};

function GuessExample({ guessType, referenceCard }: { guessType: GuessType; referenceCard?: Card }) {
  switch (guessType) {
    case "red":
      return (
        <div className="guess-cards">
          <MiniCard suit="diamonds" />
        </div>
      );
    case "black":
      return (
        <div className="guess-cards">
          <MiniCard suit="spades" />
        </div>
      );
    case "purple":
      return (
        <div className="guess-cards">
          <MiniCard suit="hearts" />
          <MiniCard suit="clubs" />
        </div>
      );
    case "doublePurple":
      return (
        <div className="guess-cards">
          <MiniCard suit="hearts" />
          <MiniCard suit="clubs" />
          <MiniCard suit="diamonds" />
          <MiniCard suit="spades" />
        </div>
      );
    case "skubrum":
      return (
        <div className="guess-cards">
          <MiniCard suit="hearts" />
          <MiniCard suit="diamonds" />
          <MiniCard suit="hearts" />
        </div>
      );
    case "sandwich":
      return (
        <div className="guess-cards">
          <MiniCard suit="hearts" />
          <MiniCard suit="spades" />
          <MiniCard suit="hearts" />
        </div>
      );
    case "higher":
      return referenceCard ? <MiniCard rank={referenceCard.rank} suit={referenceCard.suit} /> : null;
    case "lower":
      return referenceCard ? <MiniCard rank={referenceCard.rank} suit={referenceCard.suit} /> : null;
  }
}

const REVEAL_BASE_MS = 560;
const REVEAL_STAGGER_MS = 90;
const REVEAL_BUFFER_MS = 220;

type RevealMode = "auto" | "manual";
const REVEAL_MODE_STORAGE_KEY = "purple:reveal-mode";

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealGame, setRevealGame] = useState<GameState | null>(null);
  const [roundKey, setRoundKey] = useState(0);
  const [revealMode, setRevealModeState] = useState<RevealMode>("auto");
  const [manualCardsShown, setManualCardsShown] = useState(0);
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

      const storedMode = window.localStorage.getItem(REVEAL_MODE_STORAGE_KEY);
      if (storedMode === "auto" || storedMode === "manual") setRevealModeState(storedMode);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  function setRevealMode(mode: RevealMode) {
    setRevealModeState(mode);
    window.localStorage.setItem(REVEAL_MODE_STORAGE_KEY, mode);
  }

  function act(guessType: GuessType) {
    if (!game || busy.current) return;
    busy.current = true;
    const next = submitGuess(game, guessType);
    const cardCount = next.lastGuess?.cards.length ?? 1;
    setRevealGame(next);
    setRevealing(true);
    setRoundKey((key) => key + 1);

    if (revealMode === "manual" && cardCount > 1) {
      setManualCardsShown(1);
      return;
    }

    feedback(next.lastGuess?.outcome === "success" ? "success" : "failure");
    const revealMs = REVEAL_BASE_MS + cardCount * REVEAL_STAGGER_MS + REVEAL_BUFFER_MS;
    window.setTimeout(() => {
      saveCurrentGame(next);
      setGame(next);
      setRevealing(false);
      busy.current = false;
    }, revealMs);
  }

  function revealNextCard() {
    if (!revealGame || manualCardsShown === 0) return;
    const cardCount = revealGame.lastGuess?.cards.length ?? 1;
    const nextCount = manualCardsShown + 1;
    if (nextCount < cardCount) {
      setManualCardsShown(nextCount);
      return;
    }
    feedback(revealGame.lastGuess?.outcome === "success" ? "success" : "failure");
    saveCurrentGame(revealGame);
    setGame(revealGame);
    setRevealing(false);
    setManualCardsShown(0);
    busy.current = false;
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
  const isManualPending = revealing && revealMode === "manual" && manualCardsShown > 0;
  const visibleCards = lastGuess
    ? isManualPending
      ? lastGuess.cards.slice(0, manualCardsShown)
      : lastGuess.cards
    : [];

  return (
    <main className="purple-shell safe-shell">
      <header className="purple-header">
        <Brand compact />
        <div className="purple-reveal-toggle" role="group" aria-label="Mode de révélation">
          <button
            type="button"
            className={
              revealMode === "auto"
                ? "purple-reveal-toggle-button is-selected"
                : "purple-reveal-toggle-button"
            }
            aria-pressed={revealMode === "auto"}
            disabled={revealing}
            onClick={() => setRevealMode("auto")}
          >
            Auto
          </button>
          <button
            type="button"
            className={
              revealMode === "manual"
                ? "purple-reveal-toggle-button is-selected"
                : "purple-reveal-toggle-button"
            }
            aria-pressed={revealMode === "manual"}
            disabled={revealing}
            onClick={() => setRevealMode("manual")}
          >
            Manuel
          </button>
        </div>
        <BackButton homeHref="/purple" />
      </header>

      <section className="purple-stats" aria-label="État de la partie">
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
        <div className="purple-stat purple-stat--pile">
          <span className="purple-stat-label">Pot commun</span>
          <strong className="purple-stat-value">{game.pile}</strong>
        </div>
        <div className="purple-stat">
          <span className="purple-stat-label">Paquet</span>
          <strong className="purple-stat-value">{game.deck.length}</strong>
          <span className="purple-stat-hint">cartes</span>
        </div>
      </section>

      <section className="purple-active-player">
        <div className="purple-active-copy">
          <span className="purple-active-label">AU TOUR DE</span>
          <span className="purple-active-name">{currentPlayer?.name}</span>
        </div>
      </section>

      <section
        className={[
          "purple-stage",
          isManualPending ? "purple-stage--tappable" : "",
          lastGuess ? "purple-stage--has-result" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
        onClick={isManualPending ? revealNextCard : undefined}
      >
        {lastGuess ? (
          <div className="purple-stage-content">
            <div className="cards-reveal-row" key={roundKey}>
              {visibleCards.map((card, index) => (
                <PlayingCard card={card} index={index} key={card.id} />
              ))}
            </div>
            <div className="purple-stage-result">
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
            </div>
          </div>
        ) : (
          <div className="purple-idle">
            <p>Choisissez une carte à deviner.</p>
          </div>
        )}
      </section>

      <section className="purple-actions">
        <div className="guess-grid" role="group" aria-label="Choix de la carte">
          {GUESS_ORDER.map((guessType) => {
            const isHigherLower = guessType === "higher" || guessType === "lower";
            const label = isHigherLower
              ? `${GUESS_LABEL[guessType]} que`
              : GUESS_LABEL[guessType];
            return (
              <button
                key={guessType}
                type="button"
                className={`guess-button guess-button--${guessType} ${isHigherLower ? "guess-button--higher-lower" : ""}`}
                onClick={() => act(guessType)}
                disabled={revealing || (isHigherLower && !canPlayHigherLower(game))}
              >
                <span className="guess-button-label">{label}</span>
                <GuessExample guessType={guessType} referenceCard={game.lastCard} />
              </button>
            );
          })}
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
