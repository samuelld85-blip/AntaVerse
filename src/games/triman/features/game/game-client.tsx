"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand, LogoMark } from "@/games/triman/components/brand";
import {
  getCurrentPlayer,
  getTrimanPlayer,
  rollForCurrentPlayer,
} from "@/games/triman/lib/game/engine";
import { loadCurrentGame, saveCurrentGame } from "@/games/triman/lib/game/persistence";
import type { GameState } from "@/games/triman/lib/game/types";

const ROLL_ANIMATION_MS = 360;

// Pip layout for a d6 face on a 3x3 grid (cell indices 0-8, left-to-right,
// top-to-bottom).
const PIP_LAYOUTS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const [ready, setReady] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = loadCurrentGame();
      if (!stored) {
        router.replace("/triman/joueurs");
        return;
      }
      setGame(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (!announcement) return;
    const timer = window.setTimeout(() => setAnnouncement(null), 2_200);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  function commit(next: GameState) {
    saveCurrentGame(next);
    setGame(next);
  }

  function roll() {
    if (!game || rolling || announcement) return;
    locked.current = true;
    setRolling(true);
    window.setTimeout(() => {
      const next = rollForCurrentPlayer(game);
      commit(next);
      setRolling(false);
      locked.current = false;

      if (next.lastRoll?.trimanFound) {
        const triman = getTrimanPlayer(next);
        feedback("found");
        if (triman) setAnnouncement(triman.name);
      } else if (next.lastRoll && next.lastRoll.effects.length > 0) {
        feedback("effect");
      } else {
        feedback("pass");
      }
    }, ROLL_ANIMATION_MS);
  }

  function dismissAnnouncement() {
    setAnnouncement(null);
  }

  if (!ready || !game) {
    return (
      <main className="game-shell safe-shell game-loading" aria-busy="true">
        <LogoMark />
        <p>Préparation de la table…</p>
      </main>
    );
  }

  const currentPlayer = getCurrentPlayer(game);
  const triman = getTrimanPlayer(game);
  const isSearching = game.phase === "SEARCHING_TRIMAN";
  const lastRoll = game.lastRoll;
  const roller = lastRoll
    ? (game.players.find((player) => player.id === lastRoll.playerId) ?? null)
    : null;
  const diceA = lastRoll?.dice.a ?? 1;
  const diceB = lastRoll?.dice.b ?? 1;

  return (
    <main className="game-shell safe-shell triman-shell">
      <header className="game-header">
        <Brand compact />
        <p className={isSearching ? "round-pill round-pill--search" : "round-pill"}>
          {isSearching ? "Recherche du Triman" : "Triman actif"}
        </p>
      </header>

      {triman ? (
        <p className="triman-badge">
          <span aria-hidden="true">👑</span> Triman : <strong>{triman.name}</strong>
        </p>
      ) : null}

      <button
        type="button"
        className="roll-surface"
        onClick={roll}
        disabled={rolling}
        aria-label="Lancer les dés"
      >
        <p className="current-player-label">{isSearching ? "Cherche le Triman" : "Au tour de"}</p>
        <h1 className="current-player-name" key={`${game.currentPlayerIndex}-${game.phase}`}>
          {currentPlayer.name}
        </h1>

        <div className={rolling ? "dice-row dice-row--rolling" : "dice-row"}>
          <Die value={diceA} rolling={rolling} />
          <Die value={diceB} rolling={rolling} />
        </div>

        <p className="tap-hint">
          {rolling
            ? "…"
            : lastRoll?.rollAgain
              ? "Retapez pour relancer"
              : "Touchez l’écran pour lancer les dés"}
        </p>
      </button>

      <section className="effects-panel" aria-live="polite">
        <ResultPanel lastRoll={lastRoll} roller={roller} />
      </section>

      {announcement ? (
        <div
          className="triman-announcement"
          role="status"
          onClick={dismissAnnouncement}
          aria-label={`${announcement} devient le Triman`}
        >
          <p className="eyebrow">Triman trouvé !</p>
          <h1>{announcement}</h1>
          <p>Touchez pour continuer</p>
        </div>
      ) : null}
    </main>
  );
}

function ResultPanel({
  lastRoll,
  roller,
}: {
  lastRoll: GameState["lastRoll"];
  roller: GameState["players"][number] | null;
}) {
  if (!lastRoll || !roller) {
    return <p className="result-placeholder">Premier lancer : touchez l’écran pour commencer !</p>;
  }

  if (lastRoll.phaseAtRoll === "SEARCHING_TRIMAN") {
    if (lastRoll.trimanFound) {
      return (
        <p className="result-placeholder result-placeholder--triman">
          {roller.name} devient le Triman !
        </p>
      );
    }
    return <p className="result-placeholder">Pas de Triman pour {roller.name}. Au suivant !</p>;
  }

  if (lastRoll.effects.length === 0) {
    return (
      <p className="result-placeholder">
        Aucune règle déclenchée pour {roller.name}. Tour suivant.
      </p>
    );
  }

  return (
    <ul className="effects-list">
      {lastRoll.effects.map((effect, index) => (
        <li
          key={index}
          className={effect.isReflex ? "effect-card effect-card--reflex" : "effect-card"}
        >
          <span className="effect-headline">{effect.headline}</span>
          <span className="effect-detail">{effect.detail}</span>
        </li>
      ))}
    </ul>
  );
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const active = new Set(PIP_LAYOUTS[value] ?? []);
  return (
    <div className={rolling ? "die die--rolling" : "die"} aria-hidden="true">
      <div className="die-grid">
        {Array.from({ length: 9 }, (_, cell) => (
          <span key={cell} className={active.has(cell) ? "pip pip--on" : "pip"} />
        ))}
      </div>
    </div>
  );
}

function feedback(kind: "found" | "effect" | "pass") {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(kind === "found" ? [60, 40, 60, 40, 120] : kind === "effect" ? 30 : 15);
  }
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = kind === "found" ? 0.3 : 0.12;
    oscillator.frequency.value = kind === "found" ? 720 : kind === "effect" ? 440 : 260;
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch {
    /* Le jeu reste entièrement utilisable sans audio. */
  }
}
