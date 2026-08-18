"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import {
  resolveStopTimerDuel,
  resolveStopTimerSolo,
} from "@/games/roulette-du-chaos/lib/game/mini-games/stop-timer";
import { MiniGameShell } from "./mini-game-shell";
import { PassAndHide } from "./pass-and-hide";
import type { MiniGameProps } from "./types";

type DuelStep = "handoffA" | "playA" | "handoffB" | "playB" | "result";
type SoloStep = "handoff" | "play" | "result";

const INSTRUCTION = "Arrête le chrono caché le plus près possible de 5,00 secondes.";

export function StopTimer(props: MiniGameProps) {
  return props.mode === "solo" ? <StopTimerSolo {...props} /> : <StopTimerDuel {...props} />;
}

function StopTimerDuel({ playerA, playerB, onComplete }: MiniGameProps) {
  const opponent = playerB!;
  const [step, setStep] = useState<DuelStep>("handoffA");
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedA, setElapsedA] = useState(0);
  const [winner, setWinner] = useState<"a" | "b" | null>(null);

  function start() {
    setStartedAt(Date.now());
  }

  function stop(who: "a" | "b") {
    const elapsed = Date.now() - startedAt;
    if (who === "a") {
      setElapsedA(elapsed);
      setStep("handoffB");
    } else {
      const result = resolveStopTimerDuel(elapsedA, elapsed);
      setWinner(result === "tie" ? "a" : result);
      setStep("result");
    }
  }

  return (
    <MiniGameShell title="Chrono commun" instruction={INSTRUCTION}>
      {step === "handoffA" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("playA")} />
      ) : null}
      {step === "playA" ? <StopTimerRunner onStart={start} onStop={() => stop("a")} /> : null}
      {step === "handoffB" ? (
        <PassAndHide
          playerName={opponent.name}
          revealed={false}
          onReveal={() => setStep("playB")}
        />
      ) : null}
      {step === "playB" ? <StopTimerRunner onStart={start} onStop={() => stop("b")} /> : null}
      {step === "result" && winner ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">
            {winner === "a" ? playerA.name : opponent.name} gagne !
          </p>
          <Button
            type="button"
            onClick={() =>
              onComplete({
                mode: "duel",
                winnerId: winner === "a" ? playerA.id : opponent.id,
                loserId: winner === "a" ? opponent.id : playerA.id,
                success: null,
                tie: false,
              })
            }
          >
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}

function StopTimerSolo({ playerA, onComplete }: MiniGameProps) {
  const [step, setStep] = useState<SoloStep>("handoff");
  const [startedAt, setStartedAt] = useState(0);
  const [success, setSuccess] = useState(false);

  function start() {
    setStartedAt(Date.now());
  }

  function stop() {
    const elapsed = Date.now() - startedAt;
    setSuccess(resolveStopTimerSolo(elapsed));
    setStep("result");
  }

  return (
    <MiniGameShell title="Défi Stop Timer" instruction={INSTRUCTION}>
      {step === "handoff" ? (
        <PassAndHide playerName={playerA.name} revealed={false} onReveal={() => setStep("play")} />
      ) : null}
      {step === "play" ? <StopTimerRunner onStart={start} onStop={stop} /> : null}
      {step === "result" ? (
        <div className="mini-game-result">
          <p className="mini-game-result-headline">{success ? "Défi réussi !" : "Défi manqué"}</p>
          <Button
            type="button"
            onClick={() =>
              onComplete({ mode: "solo", winnerId: null, loserId: null, success, tie: false })
            }
          >
            Continuer <span aria-hidden="true">→</span>
          </Button>
        </div>
      ) : null}
    </MiniGameShell>
  );
}

function StopTimerRunner({ onStart, onStop }: { onStart: () => void; onStop: () => void }) {
  const [running, setRunning] = useState(false);
  return (
    <div className="stop-timer-runner">
      <p className="stop-timer-hint">{running ? "Le chrono tourne…" : "Prêt·e ?"}</p>
      <Button
        type="button"
        onClick={() => {
          if (!running) {
            setRunning(true);
            onStart();
          } else {
            onStop();
          }
        }}
      >
        {running ? "STOP !" : "Démarrer"}
      </Button>
    </div>
  );
}
