"use client";

import { useEffect, useState } from "react";
import type { Player, WordDuelRequest } from "../lib/game/types";

export function WordDuel({
  request,
  players,
  onResult,
}: {
  request: WordDuelRequest;
  players: Player[];
  onResult: (key: string) => void;
}) {
  const [phase, setPhase] = useState<"word" | "ready" | "running" | "done">("word");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(request.durationSeconds);
  const attacker = players.find((player) => player.id === request.attackerId)?.name ?? "Attaquant";
  const defender = players.find((player) => player.id === request.defenderId)?.name ?? "Défenseur";

  useEffect(() => {
    if (phase !== "running" || deadline === null) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setPhase("done");
    };
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [phase, deadline]);

  return (
    <div className="word-duel">
      {phase === "word" ? (
        <>
          <h2>Mot à faire dire</h2>
          <p>
            {attacker} et {defender} regardent le mot. {attacker} doit le faire prononcer à{" "}
            {defender}, sans le dire lui-même.
          </p>
          <p className="word-duel-secret">{request.word}</p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => setPhase("ready")}
          >
            Mot mémorisé · masquer
          </button>
        </>
      ) : phase === "ready" ? (
        <>
          <h2>À toi de jouer</h2>
          <p>
            {attacker} a {request.durationSeconds} secondes pour faire dire le mot à {defender} sans
            le prononcer lui-même.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              setDeadline(Date.now() + request.durationSeconds * 1000);
              setSecondsLeft(request.durationSeconds);
              setPhase("running");
            }}
          >
            Lancer les {request.durationSeconds} secondes
          </button>
        </>
      ) : phase === "running" ? (
        <>
          <p className="word-duel-countdown" aria-live="polite">
            {secondsLeft}
          </p>
          <p>Le défenseur évite le mot. L’attaquant ne le prononce pas non plus.</p>
          <button type="button" className="button" onClick={() => setPhase("done")}>
            Arrêter et annoncer le résultat
          </button>
        </>
      ) : (
        <>
          <h2>Qui a dit le mot ?</h2>
          <p>Le mot était « {request.word} ».</p>
          <div className="word-duel-results">
            <button
              type="button"
              className="button button--primary"
              onClick={() => onResult("defenderSaid")}
            >
              {defender} l’a dit
            </button>
            <button type="button" className="button" onClick={() => onResult("attackerSaid")}>
              {attacker} l’a dit
            </button>
            <button type="button" className="button" onClick={() => onResult("held")}>
              Personne · défense réussie
            </button>
          </div>
        </>
      )}
    </div>
  );
}
