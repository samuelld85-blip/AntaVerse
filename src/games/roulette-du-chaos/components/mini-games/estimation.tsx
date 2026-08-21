"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import { ESTIMATION_QUESTIONS } from "@/games/roulette-du-chaos/data/content/estimation-questions";
import {
  pickQuestionIndex,
  resolveEstimation,
} from "@/games/roulette-du-chaos/lib/game/mini-games/estimation";
import { MiniGameShell } from "./mini-game-shell";
import { PassAndHide } from "./pass-and-hide";
import { duelOutcome, type MiniGameProps } from "./types";

type Step = "handoffA" | "playA" | "handoffB" | "playB" | "result";

function randomQuestion() {
  return ESTIMATION_QUESTIONS[pickQuestionIndex(Math.random(), ESTIMATION_QUESTIONS.length)]!;
}

/** Estimation éclair (spec §19): both guess a number for the same question; closest wins, a tie draws a new question. */
export function Estimation({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [question, setQuestion] = useState(randomQuestion);
  const [step, setStep] = useState<Step>("handoffA");
  const [guessInput, setGuessInput] = useState("");
  const [guessA, setGuessA] = useState<number | null>(null);
  const [guessB, setGuessB] = useState<number | null>(null);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);

  function submit(who: "a" | "b") {
    const value = Number.parseFloat(guessInput.replace(",", "."));
    if (Number.isNaN(value)) return;
    setGuessInput("");
    if (who === "a") {
      setGuessA(value);
      setStep("handoffB");
      return;
    }
    const result = resolveEstimation(question.answer, guessA!, value);
    if (result === "tie") {
      setQuestion(randomQuestion());
      setGuessA(null);
      setGuessB(null);
      setStep("handoffA");
      return;
    }
    setGuessB(value);
    setWinner(result);
    setStep("result");
  }

  const unit = question.unit ?? "";

  const guessForm = (who: "a" | "b") => (
    <form
      className="estimation-form"
      onSubmit={(event) => {
        event.preventDefault();
        submit(who);
      }}
    >
      <p className="estimation-question">{question.question}</p>
      <input
        type="number"
        inputMode="decimal"
        className="estimation-input"
        value={guessInput}
        onChange={(event) => setGuessInput(event.target.value)}
        autoFocus
        required
      />
      <Button type="submit">Valider</Button>
    </form>
  );

  return (
    <MiniGameShell title="Estimation éclair" instruction="Devine la bonne réponse, au plus près.">
      {step === "handoffA" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("playA")} />
      ) : null}
      {step === "playA" ? guessForm("a") : null}
      {step === "handoffB" ? (
        <PassAndHide
          playerName={opponent.name}
          revealed={false}
          onReveal={() => setStep("playB")}
        />
      ) : null}
      {step === "playB" ? guessForm("b") : null}
      {step === "result" && winner ? (
        <div className="mini-game-result">
          <div className="mini-game-answer-reveal">
            <p className="mini-game-answer-reveal-label">Bonne réponse</p>
            <p className="mini-game-answer-reveal-value">
              {question.answer}
              {unit}
            </p>
          </div>
          <p className="mini-game-result-detail">
            {playerA.name} : {guessA}
            {unit} · {opponent.name} : {guessB}
            {unit}
          </p>
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
