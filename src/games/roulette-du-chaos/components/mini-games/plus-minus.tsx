"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  PLUS_MINUS_MAX,
  PLUS_MINUS_MIN,
  drawPlusMinusValue,
  resolvePlusMinus,
  type PlusMinusGuess,
} from "@/games/roulette-du-chaos/lib/game/mini-games/plus-minus";
import { MiniGameShell } from "./mini-game-shell";
import { PassAndHide } from "./pass-and-hide";
import { duelOutcome, type MiniGameProps } from "./types";

type Step = "handoffA" | "playA" | "handoffB" | "playB" | "result";

function randomStart(): number {
  return PLUS_MINUS_MIN + Math.floor(Math.random() * (PLUS_MINUS_MAX - PLUS_MINUS_MIN + 1));
}

function draw(start: number): number {
  return drawPlusMinusValue(start, Math.random());
}

/** Plus ou moins (spec §17): same guess plays both against the app and replays on a wash; different guesses, the correct one wins. */
export function PlusMinus({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [start, setStart] = useState(randomStart);
  const [step, setStep] = useState<Step>("handoffA");
  const [guessA, setGuessA] = useState<PlusMinusGuess | null>(null);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);

  function pick(who: "a" | "b", guess: PlusMinusGuess) {
    if (who === "a") {
      setGuessA(guess);
      setStep("handoffB");
      return;
    }
    const drawn = draw(start);
    const result = resolvePlusMinus(start, drawn, guessA!, guess);
    if (result === "aWins" || result === "bWins") {
      setWinner(result === "aWins" ? "a" : "b");
      setStep("result");
      return;
    }
    // bothCorrect or bothWrong: no decisive winner, redraw with a fresh start value.
    setGuessA(null);
    setStart(randomStart());
    setStep("handoffA");
  }

  const guessButtons = (who: "a" | "b") => (
    <div className="plus-minus-choice">
      <p className="plus-minus-start">Nombre de départ : {start}</p>
      <div className="choice-buttons-grid">
        <button type="button" className="choice-button" onClick={() => pick(who, "moins")}>
          <span aria-hidden="true">↓</span> Moins
        </button>
        <button type="button" className="choice-button" onClick={() => pick(who, "plus")}>
          <span aria-hidden="true">↑</span> Plus
        </button>
      </div>
    </div>
  );

  return (
    <MiniGameShell
      title="Plus ou moins"
      instruction="Le prochain tirage sera-t-il plus grand ou plus petit ?"
    >
      {step === "handoffA" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("playA")} />
      ) : null}
      {step === "playA" ? guessButtons("a") : null}
      {step === "handoffB" ? (
        <PassAndHide
          playerName={opponent.name}
          revealed={false}
          onReveal={() => setStep("playB")}
        />
      ) : null}
      {step === "playB" ? guessButtons("b") : null}
      {step === "result" && winner ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            {winner === "a" ? playerA.name : opponent.name} gagne !
          </p>
          <Button type="button" onClick={() => onComplete(duelOutcome(winner, playerA, opponent))}>
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
