"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  drawBinaryResult,
  resolveBinaryPrediction,
  type BinaryOption,
} from "@/games/roulette-du-chaos/lib/game/mini-games/binary-prediction";
import { MiniGameShell } from "./mini-game-shell";
import { PassAndHide } from "./pass-and-hide";
import { duelOutcome, type MiniGameProps } from "./types";

type Step = "handoffA" | "playA" | "handoffB" | "playB" | "result";

function draw(): BinaryOption {
  return drawBinaryResult(Math.random());
}

/** Rouge ou noir (spec §22): both secretly call rouge/noir; exactly one correct guess wins, otherwise replay. */
export function BinaryPrediction({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [step, setStep] = useState<Step>("handoffA");
  const [guessA, setGuessA] = useState<BinaryOption | null>(null);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);
  const [lastResult, setLastResult] = useState<BinaryOption | null>(null);

  function pick(who: "a" | "b", guess: BinaryOption) {
    if (who === "a") {
      setGuessA(guess);
      setStep("handoffB");
      return;
    }
    const result = draw();
    const outcome = resolveBinaryPrediction(result, guessA!, guess);
    setLastResult(result);
    if (outcome === "replay") {
      setGuessA(null);
      setStep("handoffA");
      return;
    }
    setWinner(outcome);
    setStep("result");
  }

  const choiceButtons = (who: "a" | "b") => (
    <div className="choice-buttons-grid">
      <button
        type="button"
        className="choice-button choice-button--rouge"
        onClick={() => pick(who, "rouge")}
      >
        Rouge
      </button>
      <button
        type="button"
        className="choice-button choice-button--noir"
        onClick={() => pick(who, "noir")}
      >
        Noir
      </button>
    </div>
  );

  return (
    <MiniGameShell title="Rouge ou noir" instruction="Prédis la couleur qui va sortir.">
      {step === "handoffA" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("playA")} />
      ) : null}
      {step === "playA" ? choiceButtons("a") : null}
      {step === "handoffB" ? (
        <PassAndHide
          playerName={opponent.name}
          revealed={false}
          onReveal={() => setStep("playB")}
        />
      ) : null}
      {step === "playB" ? choiceButtons("b") : null}
      {step === "result" && winner ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            C&apos;était {lastResult} — {winner === "a" ? playerA.name : opponent.name} gagne !
          </p>
          <Button type="button" onClick={() => onComplete(duelOutcome(winner, playerA, opponent))}>
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
