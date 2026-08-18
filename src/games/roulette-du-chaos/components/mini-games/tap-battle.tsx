"use client";

import { useRef, useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  TAP_BATTLE_DURATION_MS,
  resolveTapBattle,
} from "@/games/roulette-du-chaos/lib/game/mini-games/tap-battle";
import { MiniGameShell } from "./mini-game-shell";
import { duelOutcome, type MiniGameProps } from "./types";

type Phase = "ready" | "countdown" | "playing" | "result";

const COUNTDOWN_STEP_MS = 600;

/** Tap Battle (spec §21): 5 seconds of simultaneous tapping, most taps wins; a tie replays. */
export function TapBattle({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [phase, setPhase] = useState<Phase>("ready");
  const [countdown, setCountdown] = useState(3);
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);
  const countARef = useRef(0);
  const countBRef = useRef(0);

  function tick(remaining: number) {
    if (remaining <= 0) {
      countARef.current = 0;
      countBRef.current = 0;
      setCountA(0);
      setCountB(0);
      setPhase("playing");
      window.setTimeout(() => {
        const result = resolveTapBattle(countARef.current, countBRef.current);
        if (result === "tie") {
          setPhase("countdown");
          setCountdown(3);
          window.setTimeout(() => tick(2), COUNTDOWN_STEP_MS);
          return;
        }
        setWinner(result);
        setPhase("result");
      }, TAP_BATTLE_DURATION_MS);
      return;
    }
    setCountdown(remaining);
    window.setTimeout(() => tick(remaining - 1), COUNTDOWN_STEP_MS);
  }

  function startCountdown() {
    setPhase("countdown");
    setCountdown(3);
    window.setTimeout(() => tick(2), COUNTDOWN_STEP_MS);
  }

  function tap(who: "a" | "b") {
    if (phase !== "playing") return;
    if (who === "a") {
      countARef.current += 1;
      setCountA(countARef.current);
    } else {
      countBRef.current += 1;
      setCountB(countBRef.current);
    }
  }

  return (
    <MiniGameShell
      title="Tap Battle"
      instruction="Touchez votre zone le plus vite possible pendant 5 secondes."
    >
      {phase === "ready" ? (
        <Button type="button" onClick={startCountdown}>
          C&apos;est parti
        </Button>
      ) : null}
      {phase === "countdown" ? (
        <p className="tap-battle-countdown">{countdown > 0 ? countdown : "GO !"}</p>
      ) : null}
      {phase === "playing" ? (
        <div className="tap-battle-arena">
          <button type="button" className="tap-battle-zone" onClick={() => tap("a")}>
            {playerA.name}
            <span className="tap-battle-count">{countA}</span>
          </button>
          <button type="button" className="tap-battle-zone" onClick={() => tap("b")}>
            {opponent.name}
            <span className="tap-battle-count">{countB}</span>
          </button>
        </div>
      ) : null}
      {phase === "result" && winner ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            {winner === "a" ? playerA.name : opponent.name} gagne ! ({countA} - {countB})
          </p>
          <Button type="button" onClick={() => onComplete(duelOutcome(winner, playerA, opponent))}>
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}
