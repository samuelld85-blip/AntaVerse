"use client";

import { useEffect, useRef, useState } from "react";
import { MiniGameShell } from "./mini-game-shell";
import { duelOutcome, type MiniGameProps } from "./types";

type Phase = "wait" | "go" | "result";
type PlayerSide = "a" | "b";

type Result =
  | "a"
  | "b"
  | "falseStartA"
  | "falseStartB"
  | "tie"
  | null;

const MIN_DELAY_MS = 1_000;
const MAX_DELAY_MS = 3_000;

/**
 * Deux taps de joueurs différents séparés de 50 ms ou moins
 * sont considérés comme simultanés.
 */
const TIE_WINDOW_MS = 50;

/**
 * Duel de réflexes :
 *
 * - avant GO :
 *   - un joueur touche seul → faux départ → il perd ;
 *   - les deux touchent quasi simultanément → égalité, on rejoue.
 *
 * - après GO :
 *   - premier joueur à toucher → gagne ;
 *   - les deux touchent quasi simultanément → égalité, on rejoue.
 */
export function Reflex({
  playerA,
  playerB,
  onComplete,
}: MiniGameProps) {
  const opponent = playerB!;

  const [phase, setPhase] = useState<Phase>("wait");
  const [result, setResult] = useState<Result>(null);
  const [round, setRound] = useState(0);

  /**
   * Source de vérité synchrone pour savoir si GO a réellement commencé.
   *
   * On ne se repose pas uniquement sur `phase`, car setState est asynchrone
   * et pourrait créer une race condition exactement au moment du GO.
   */
  const goStartedRef = useRef(false);

  /**
   * Premier tap candidat.
   *
   * On attend TIE_WINDOW_MS avant de le valider afin de laisser
   * à l'autre joueur la possibilité d'avoir touché quasiment
   * simultanément.
   */
  const firstTapRef = useRef<{
    who: PlayerSide;
    at: number;
    afterGo: boolean;
  } | null>(null);

  /**
   * Empêche toute modification une fois le résultat décidé.
   */
  const resultLockedRef = useRef(false);

  /**
   * Empêche plusieurs appels à onComplete si le bouton
   * "Continuer" est activé plusieurs fois rapidement.
   */
  const completedRef = useRef(false);

  const goTimerRef = useRef<number | null>(null);
  const resolveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    resultLockedRef.current = false;
    completedRef.current = false;
    firstTapRef.current = null;
    goStartedRef.current = false;

    setResult(null);
    setPhase("wait");

    const delay =
      MIN_DELAY_MS +
      Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);

    goTimerRef.current = window.setTimeout(() => {
      if (resultLockedRef.current) return;

      /**
       * Important :
       * le ref passe à true AVANT setPhase().
       *
       * Ainsi un tap reçu exactement à cet instant est correctement
       * considéré comme post-GO même si React n'a pas encore rerendu.
       */
      goStartedRef.current = true;
      setPhase("go");
    }, delay);

    return () => {
      if (goTimerRef.current !== null) {
        window.clearTimeout(goTimerRef.current);
        goTimerRef.current = null;
      }

      if (resolveTimerRef.current !== null) {
        window.clearTimeout(resolveTimerRef.current);
        resolveTimerRef.current = null;
      }
    };
  }, [round]);

  function finish(nextResult: Exclude<Result, null>) {
    if (resultLockedRef.current) return;

    resultLockedRef.current = true;

    if (goTimerRef.current !== null) {
      window.clearTimeout(goTimerRef.current);
      goTimerRef.current = null;
    }

    if (resolveTimerRef.current !== null) {
      window.clearTimeout(resolveTimerRef.current);
      resolveTimerRef.current = null;
    }

    setResult(nextResult);
    setPhase("result");
  }

  function tap(who: PlayerSide) {
    if (resultLockedRef.current) return;

    const now = performance.now();
    const afterGo = goStartedRef.current;

    const firstTap = firstTapRef.current;

    /**
     * Premier joueur à toucher.
     *
     * On ne décide pas immédiatement du résultat :
     * on ouvre une fenêtre de 50 ms pour détecter
     * un éventuel tap simultané de l'adversaire.
     */
    if (!firstTap) {
      firstTapRef.current = {
        who,
        at: now,
        afterGo,
      };

      resolveTimerRef.current = window.setTimeout(() => {
        const candidate = firstTapRef.current;

        if (!candidate || resultLockedRef.current) return;

        if (candidate.afterGo) {
          // Premier tap valide après GO.
          finish(candidate.who);
        } else {
          // Faux départ d'un seul joueur.
          finish(
            candidate.who === "a"
              ? "falseStartA"
              : "falseStartB",
          );
        }
      }, TIE_WINDOW_MS);

      return;
    }

    /**
     * Double tap du même joueur :
     * aucune incidence.
     */
    if (firstTap.who === who) {
      return;
    }

    const difference = now - firstTap.at;

    /**
     * L'autre joueur touche dans la fenêtre de simultanéité.
     */
    if (difference <= TIE_WINDOW_MS) {
      /**
       * Même situation logique :
       *
       * - les deux avant GO → double faux départ → égalité ;
       * - les deux après GO → départ simultané → égalité.
       */
      if (firstTap.afterGo === afterGo) {
        finish("tie");
        return;
      }

      /**
       * Cas limite :
       * le premier a touché AVANT le GO et le second APRÈS.
       *
       * Ce n'est pas une égalité :
       * le premier joueur a réellement fait un faux départ.
       */
      if (!firstTap.afterGo && afterGo) {
        finish(
          firstTap.who === "a"
            ? "falseStartA"
            : "falseStartB",
        );
      }
    }
  }

  const winner: PlayerSide | null =
    result === "a" || result === "falseStartB"
      ? "a"
      : result === "b" || result === "falseStartA"
        ? "b"
        : null;

  function replay() {
    firstTapRef.current = null;
    resultLockedRef.current = false;
    goStartedRef.current = false;

    setResult(null);
    setPhase("wait");
    setRound((value) => value + 1);
  }

  function complete() {
    if (!winner || completedRef.current) return;

    completedRef.current = true;

    onComplete(
      duelOutcome(
        winner,
        playerA,
        opponent,
      ),
    );
  }

  return (
    <MiniGameShell
      title="Duel de réflexes"
      instruction={
        phase === "wait"
          ? "Attendez le signal GO ! Toucher trop tôt = défaite immédiate."
          : phase === "go"
            ? "GO ! Touchez votre zone le plus vite possible."
            : result === "tie"
              ? "Égalité !"
              : "Résultat"
      }
    >
      {phase !== "result" ? (
        <div
          className="reflex-arena"
          data-armed={phase === "go"}
        >
          <button
            type="button"
            className="reflex-zone reflex-zone--a"
            onPointerDown={() => tap("a")}
          >
            {phase === "go"
              ? "GO !"
              : playerA.name}
          </button>

          <button
            type="button"
            className="reflex-zone reflex-zone--b"
            onPointerDown={() => tap("b")}
          >
            {phase === "go"
              ? "GO !"
              : opponent.name}
          </button>
        </div>
      ) : (
        <div className="mini-game-result">
          {result === "tie" ? (
            <>
              <p className="mini-game-result-headline">
                Égalité ! Aucun point.
              </p>

              <button
                type="button"
                className="button button--primary"
                onClick={replay}
              >
                Rejouer{" "}
                <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <>
              <p className="mini-game-result-headline">
                {winner === "a"
                  ? playerA.name
                  : opponent.name}{" "}
                gagne !
                {result?.startsWith("falseStart")
                  ? " (faux départ adverse)"
                  : ""}
              </p>

              <button
                type="button"
                className="button button--primary"
                onClick={complete}
              >
                Continuer{" "}
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>
      )}
    </MiniGameShell>
  );
}