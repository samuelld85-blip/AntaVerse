"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/games/shared/components/ui";
import { getEvent } from "@/games/roulette-du-chaos/data/events";
import { rollDie } from "@/games/roulette-du-chaos/lib/game/resolution-helpers";
import { getCategory } from "@/games/roulette-du-chaos/lib/game/wheel";
import type { TurnOutcome, VisualHint } from "@/games/roulette-du-chaos/lib/game/types";
import type { GameState } from "@/games/roulette-du-chaos/lib/game/types";
import { ChoiceButtons } from "./choice-buttons";
import { CoinFlip } from "./coin-flip";
import { DieFace } from "./die-face";
import { MysteryPicker } from "./mystery-picker";
import { NeighborPicker } from "./neighbor-picker";
import { TargetPicker } from "./target-picker";

const REVEAL_ANIMATION_MS = 1000;

/**
 * Delays showing `children` by REVEAL_ANIMATION_MS when `animate` is set —
 * keyed by the caller on the outcome's identity so each new outcome remounts
 * with a fresh timer instead of needing manual reset logic.
 */
function RevealGate({
  animate,
  pending,
  children,
}: {
  animate: boolean;
  pending: ReactNode;
  children: ReactNode;
}) {
  const [revealed, setRevealed] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(() => setRevealed(true), REVEAL_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [animate]);
  return <>{revealed ? children : pending}</>;
}

function OutcomeReveal({
  outcome,
  visualHint,
  dieSlot,
  onContinue,
}: {
  outcome: TurnOutcome;
  visualHint: VisualHint;
  dieSlot: number;
  onContinue: () => void;
}) {
  const animate = visualHint === "die" || visualHint === "coin";
  return (
    <RevealGate
      animate={animate}
      pending={
        visualHint === "die" ? (
          <DieFace value={rollDie(dieSlot)} rolling />
        ) : visualHint === "coin" ? (
          <CoinFlip flipping label="?" />
        ) : null
      }
    >
      <div className={`event-outcome event-outcome--${outcome.tone}`}>
        <p className="event-outcome-headline">{outcome.headline}</p>
        <ul className="event-outcome-lines">
          {outcome.lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
        <Button type="button" onClick={onContinue}>
          Continuer <span aria-hidden="true">→</span>
        </Button>
      </div>
    </RevealGate>
  );
}

export function EventCard({
  game,
  onSubmitTargets,
  onSubmitNeighbor,
  onSubmitChoice,
  onSubmitMysteryPick,
  onReveal,
  onContinue,
}: {
  game: GameState;
  onSubmitTargets: (ids: string[]) => void;
  onSubmitNeighbor: (side: "left" | "right") => void;
  onSubmitChoice: (key: string) => void;
  onSubmitMysteryPick: (index: number) => void;
  onReveal: () => void;
  onContinue: () => void;
}) {
  const resolution = game.resolution;
  const outcome = resolution?.outcome ?? null;
  const eventId = resolution?.eventId ?? null;
  const event = eventId ? getEvent(eventId) : null;

  if (!resolution || !event) return null;
  const category = getCategory(event.category);
  const outcomeKey = outcome ? `${eventId}:${outcome.headline}:${outcome.lines.join("|")}` : null;

  return (
    <section
      className={`event-card event-card--${event.category.toLowerCase()}`}
      aria-live="polite"
    >
      <p className="event-card-category">
        <span aria-hidden="true">{category.icon}</span> {category.label}
      </p>
      <h1 className="event-card-title">{event.title}</h1>
      <p className="event-card-prompt">{event.prompt}</p>

      {outcome ? (
        <OutcomeReveal
          key={outcomeKey}
          outcome={outcome}
          visualHint={event.visualHint}
          dieSlot={resolution.randomSlots.die ?? 0}
          onContinue={onContinue}
        />
      ) : null}

      {!outcome && resolution.pending?.kind === "pickTargets" ? (
        <TargetPicker
          players={game.players}
          request={resolution.pending}
          onConfirm={onSubmitTargets}
        />
      ) : null}
      {!outcome && resolution.pending?.kind === "pickNeighbor" ? (
        <NeighborPicker onChoose={onSubmitNeighbor} />
      ) : null}
      {!outcome && resolution.pending?.kind === "choice" ? (
        <ChoiceButtons request={resolution.pending} onChoose={onSubmitChoice} />
      ) : null}
      {!outcome && resolution.pending?.kind === "mysteryPick" ? (
        <MysteryPicker count={resolution.pending.count} onPick={onSubmitMysteryPick} />
      ) : null}
      {!outcome && resolution.pending?.kind === "reveal" ? (
        <div className="reveal-picker">
          {resolution.pending.detail ? (
            <p className="estimation-question">{resolution.pending.detail}</p>
          ) : (
            <>
              <div className="reveal-card" aria-label="Nombre maudit masqué">
                <span aria-hidden="true">?</span>
              </div>
              <p className="reveal-picker-label">Tout le monde a choisi ?</p>
            </>
          )}
          <Button type="button" onClick={onReveal}>
            {resolution.pending.label}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
