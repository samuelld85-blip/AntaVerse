"use client";

import { useEffect, useRef, useState } from "react";
import { resolveReflex } from "@/games/roulette-du-chaos/lib/game/mini-games/reflex";
import { MiniGameShell } from "./mini-game-shell";
import { duelOutcome, type MiniGameProps } from "./types";

type Phase = "wait" | "go" | "result";

const MIN_DELAY_MS = 1_000;
const MAX_DELAY_MS = 3_000;

/** Réflexe (spec §14): first tap after GO wins; tapping before GO is an instant loss. */
export function Reflex({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [phase, setPhase] = useState<Phase>("wait");
  const [result, setResult] = useState<"a" | "b" | "falseStartA" | "falseStartB" | null>(null);
  const goAt = useRef(0);

  useEffect(() => {
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = window.setTimeout(() => {
      goAt.current = Date.now();
      setPhase("go");
    }, delay);
    return () => window.clearTimeout(timer);
  }, []);

  function tap(who: "a" | "b") {
    if (phase === "result") return;
    if (phase === "wait") {
      setResult(who === "a" ? "falseStartA" : "falseStartB");
      setPhase("result");
      return;
    }
    const elapsed = Date.now() - goAt.current;
    const outcome = resolveReflex(
      who === "a" ? elapsed : Infinity,
      who === "b" ? elapsed : Infinity,
    );
    setResult(outcome === "tie" ? "a" : outcome);
    setPhase("result");
  }

  const winner = result === "a" || result === "falseStartB" ? "a" : "b";

  return (
    <MiniGameShell
      title="Duel de réflexes"
      instruction={
        phase === "wait"
          ? "Attendez le signal GO ! Toucher trop tôt = défaite immédiate."
          : phase === "go"
            ? "GO ! Touchez votre zone le plus vite possible."
            : "Résultat"
      }
    >
      {phase !== "result" ? (
        <div className="reflex-arena" data-armed={phase === "go"}>
          <button type="button" className="reflex-zone reflex-zone--a" onClick={() => tap("a")}>
            {phase === "go" ? "GO !" : playerA.name}
          </button>
          <button type="button" className="reflex-zone reflex-zone--b" onClick={() => tap("b")}>
            {phase === "go" ? "GO !" : opponent.name}
          </button>
        </div>
      ) : (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            {winner === "a" ? playerA.name : opponent.name} gagne !
            {result?.startsWith("falseStart") ? " (faux départ adverse)" : ""}
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onComplete(duelOutcome(winner, playerA, opponent))}
          >
            Continuer <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </MiniGameShell>
  );
}
