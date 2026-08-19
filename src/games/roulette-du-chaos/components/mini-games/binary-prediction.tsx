"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  drawBinaryResult,
  resolveBinaryPrediction,
  type BinaryOption,
} from "@/games/roulette-du-chaos/lib/game/mini-games/binary-prediction";
import { MiniGameShell } from "./mini-game-shell";
import { duelOutcome, type MiniGameProps } from "./types";

type Step = "play" | "result";

function draw(): BinaryOption {
  return drawBinaryResult(Math.random());
}

function BinaryCard({ color }: { color: BinaryOption }) {
  return (
    <div className={`binary-card binary-card--${color}`} aria-hidden="true">
      <span className="binary-card-symbol">{color === "rouge" ? "♥" : "♠"}</span>
      <span className="binary-card-label">{color === "rouge" ? "Rouge" : "Noir"}</span>
    </div>
  );
}

/** Rouge ou noir — le joueur actif devine seul. Juste → l'adversaire boit ; faux → le joueur boit. */
export function BinaryPrediction({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [step, setStep] = useState<Step>("play");
  const [drawnResult, setDrawnResult] = useState<BinaryOption | null>(null);
  const [correct, setCorrect] = useState(false);

  function pick(guess: BinaryOption) {
    const result = draw();
    const outcome = resolveBinaryPrediction(result, guess);
    setDrawnResult(result);
    setCorrect(outcome === "correct");
    setStep("result");
  }

  return (
    <MiniGameShell
      title="Rouge ou noir"
      instruction={`${playerA.name} devine. Juste → ${opponent.name} boit. Faux → ${playerA.name} boit.`}
    >
      {step === "play" ? (
        <div className="choice-buttons-grid">
          <button
            type="button"
            className="choice-button choice-button--rouge"
            onClick={() => pick("rouge")}
          >
            Rouge
          </button>
          <button
            type="button"
            className="choice-button choice-button--noir"
            onClick={() => pick("noir")}
          >
            Noir
          </button>
        </div>
      ) : null}
      {step === "result" && drawnResult !== null ? (
        <div className="mini-game-result">
          <BinaryCard color={drawnResult} />
          <p className="mini-game-result-headline">
            {correct ? `${playerA.name} a juste !` : `${playerA.name} s'est trompé·e !`}
          </p>
          <Button
            type="button"
            onClick={() =>
              onComplete(
                correct ? duelOutcome("a", playerA, opponent) : duelOutcome("b", playerA, opponent),
              )
            }
          >
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
