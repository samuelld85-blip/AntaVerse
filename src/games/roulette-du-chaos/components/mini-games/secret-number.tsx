"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  SECRET_NUMBER_MAX,
  SECRET_NUMBER_MIN,
  drawSecretTarget,
  resolveSecretNumber,
} from "@/games/roulette-du-chaos/lib/game/mini-games/secret-number";
import { MiniGameShell } from "./mini-game-shell";
import { PassAndHide } from "./pass-and-hide";
import { duelOutcome, type MiniGameProps } from "./types";

type Step = "handoffA" | "playA" | "handoffB" | "playB" | "result";

function drawTarget(): number {
  return drawSecretTarget(Math.random());
}

const OPTIONS = Array.from(
  { length: SECRET_NUMBER_MAX - SECRET_NUMBER_MIN + 1 },
  (_, index) => SECRET_NUMBER_MIN + index,
);

/** Nombre secret (spec §18): both guess 1–10, closest to the drawn target wins; a tie redraws. */
export function SecretNumber({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [step, setStep] = useState<Step>("handoffA");
  const [guessA, setGuessA] = useState<number | null>(null);
  const [revealedTarget, setRevealedTarget] = useState<number | null>(null);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);

  function pick(who: "a" | "b", guess: number) {
    if (who === "a") {
      setGuessA(guess);
      setStep("handoffB");
      return;
    }
    const target = drawTarget();
    const result = resolveSecretNumber(target, guessA!, guess);
    if (result === "tie") {
      setGuessA(null);
      setRevealedTarget(null);
      setStep("handoffA");
      return;
    }
    setRevealedTarget(target);
    setWinner(result);
    setStep("result");
  }

  const numberGrid = (who: "a" | "b") => (
    <div className="secret-number-grid" role="group" aria-label="Choisis un nombre">
      {OPTIONS.map((value) => (
        <button key={value} type="button" className="target-chip" onClick={() => pick(who, value)}>
          {value}
        </button>
      ))}
    </div>
  );

  return (
    <MiniGameShell title="Nombre secret" instruction="Choisis un nombre entre 1 et 10.">
      {step === "handoffA" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("playA")} />
      ) : null}
      {step === "playA" ? numberGrid("a") : null}
      {step === "handoffB" ? (
        <PassAndHide
          playerName={opponent.name}
          revealed={false}
          onReveal={() => setStep("playB")}
        />
      ) : null}
      {step === "playB" ? numberGrid("b") : null}
      {step === "result" && winner ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            {winner === "a" ? playerA.name : opponent.name} gagne !
          </p>
          {revealedTarget !== null ? (
            <p className="mini-game-result-detail">Le nombre à trouver était : {revealedTarget}</p>
          ) : null}
          <Button type="button" onClick={() => onComplete(duelOutcome(winner, playerA, opponent))}>
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
