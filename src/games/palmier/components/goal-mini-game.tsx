"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

// ─── Difficulty ───────────────────────────────────────────────────────────────

const GAP_BY_TIER = [3.25, 3.05, 2.9, 2.7, 2.55, 2.4, 2.25, 2.1, 1.95, 1.8];
const CARD_WIDTH = 100; // matches the rendered width below

export function getGoalTier(totalCards: number, remainingCards: number): number {
  const drawn = totalCards - remainingCards;
  return Math.min(9, Math.floor(drawn / 5));
}

export function getGoalGapMultiplier(tier: number): number {
  return GAP_BY_TIER[tier] ?? 1.8;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MiniGamePhase =
  | "idle"
  | "dragging"
  | "resolving-success"
  | "resolving-fail"
  | "revealing-card";

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface Props {
  totalCards: number;
  remainingCards: number;
  playerName: string;
  cardsLeft: number;
  maitrePouce: string | null;
  maitreQuestions: string | null;
  onResolved: (failed: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PalmierGoalMiniGame({
  totalCards,
  remainingCards,
  playerName,
  cardsLeft,
  maitrePouce,
  maitreQuestions,
  onResolved,
}: Props) {
  const [phase, setPhase] = useState<MiniGamePhase>("idle");
  const [drag, setDrag] = useState<DragState | null>(null);
  const [failShown, setFailShown] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const leftPalmRef = useRef<HTMLDivElement>(null);
  const rightPalmRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const tier = getGoalTier(totalCards, remainingCards);
  const gapPx = CARD_WIDTH * getGoalGapMultiplier(tier);

  // ─── Drag offsets ─────────────────────────────────────────────────────────
  const offsetX = drag ? drag.currentX - drag.startX : 0;
  // Only allow upward movement
  const offsetY = drag ? Math.min(0, drag.currentY - drag.startY) : 0;

  // ─── Pointer handlers ─────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (busy.current || phase !== "idle") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setPhase("dragging");
      setDrag({
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
      });
    },
    [phase],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "dragging") return;
      setDrag((d) => d && { ...d, currentX: e.clientX, currentY: e.clientY });
    },
    [phase],
  );

  const onPointerUp = useCallback(() => {
    if (phase !== "dragging" || !drag || busy.current) return;
    busy.current = true;

    // getBoundingClientRect already reflects the CSS transform, so these
    // coords are the real visual positions of the card at release.
    const leftRect = leftPalmRef.current?.getBoundingClientRect();
    const rightRect = rightPalmRef.current?.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();

    let success = false;

    if (leftRect && rightRect && cardRect) {
      // Card must have reached at least the bottom of the goal posts
      const goalBottomY = Math.max(leftRect.bottom, rightRect.bottom);
      const enoughHeight = cardRect.top < goalBottomY;

      // Full card width must be within the opening (not just the centre)
      const innerLeft = leftRect.right;
      const innerRight = rightRect.left;
      const inOpening = cardRect.left > innerLeft && cardRect.right < innerRight;

      success = enoughHeight && inOpening;
    }

    setDrag(null);

    if (success) {
      setPhase("resolving-success");
      window.setTimeout(() => {
        setPhase("revealing-card");
        busy.current = false;
        onResolved(false);
      }, 700);
    } else {
      setPhase("resolving-fail");
      setFailShown(true);
      window.setTimeout(() => {
        setPhase("revealing-card");
        busy.current = false;
        onResolved(true);
      }, 1100);
    }
  }, [phase, drag, onResolved]);

  // On cancel: reset to idle without triggering success/fail
  const onPointerCancel = useCallback(() => {
    if (phase !== "dragging") return;
    setDrag(null);
    setPhase("idle");
    busy.current = false;
  }, [phase]);

  // ─── Card transform ───────────────────────────────────────────────────────
  let cardStyle: React.CSSProperties = {};

  if (phase === "dragging") {
    cardStyle = {
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      transition: "none",
      cursor: "grabbing",
      zIndex: 20,
    };
  } else if (phase === "resolving-success") {
    cardStyle = {
      transform: "translateY(-130%) scale(1.05)",
      transition: "transform 600ms cubic-bezier(0.22,1,0.36,1)",
    };
  } else if (phase === "resolving-fail") {
    cardStyle = {
      transform: "translateY(0) rotate(10deg)",
      transition: "transform 300ms ease, opacity 300ms ease",
      opacity: 0.45,
    };
  } else {
    cardStyle = {
      transform: "translateY(0)",
      transition: "transform 350ms cubic-bezier(0.22,1,0.36,1)",
    };
  }

  const isLocked = phase !== "idle";

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <section className="plm-goal-stage">
      {/* Player info */}
      <p className="current-player-label">Au tour de</p>
      <h1 className="current-player-name">{playerName}</h1>

      {/* Goal zone */}
      <div
        className="plm-goal-zone"
        style={{ "--plm-gap": `${gapPx}px` } as React.CSSProperties}
      >
        <div className="plm-goal-palm plm-goal-palm--left" ref={leftPalmRef}>
          <Image
            src="/games/palmier/goal/palm-left.png"
            alt="Palmier gauche"
            width={72}
            height={110}
            style={{ width: 72, height: "auto" }}
          />
        </div>
        <div className="plm-goal-palm plm-goal-palm--right" ref={rightPalmRef}>
          <Image
            src="/games/palmier/goal/palm-right.png"
            alt="Palmier droit"
            width={72}
            height={110}
            style={{ width: 72, height: "auto" }}
          />
        </div>
      </div>

      {/* Fail feedback */}
      {failShown && phase === "resolving-fail" ? (
        <p className="plm-goal-fail-msg" aria-live="polite">
          Raté : +1 gorgée
        </p>
      ) : null}

      {/* Chevrons */}
      <div className="plm-goal-lane" aria-hidden="true">
        <Image
          src="/games/palmier/goal/goal-lane.png"
          alt=""
          width={48}
          height={72}
          style={{ width: 48, height: "auto", opacity: isLocked ? 0.25 : 0.85 }}
        />
      </div>

      {/* Draggable card */}
      <div className="plm-goal-card-area">
        <div
          className={`plm-goal-card${phase === "idle" ? " plm-goal-card--idle" : ""}`}
          ref={cardRef}
          style={cardStyle}
          onPointerDown={isLocked ? undefined : onPointerDown}
          onPointerMove={isLocked ? undefined : onPointerMove}
          onPointerUp={isLocked ? undefined : onPointerUp}
          onPointerCancel={isLocked ? undefined : onPointerCancel}
        >
          <Image
            src="/games/palmier/goal/card-back.png"
            alt="Carte face cachée"
            width={CARD_WIDTH}
            height={140}
            style={{ width: CARD_WIDTH, height: "auto", display: "block", pointerEvents: "none", userSelect: "none" }}
            draggable={false}
            priority
          />
        </div>

        {phase === "idle" ? (
          <div className="plm-goal-hand" aria-hidden="true">
            <Image
              src="/games/palmier/goal/swipe-hand.png"
              alt=""
              width={36}
              height={36}
              style={{ width: 36, height: "auto" }}
            />
          </div>
        ) : null}
      </div>

      {/* Help text */}
      {phase === "idle" ? (
        <div className="plm-goal-help">
          <p>Fais glisser la carte entre les deux palmiers</p>
          <p>L&apos;écart rétrécit au fil de la partie</p>
        </div>
      ) : null}

      {/* Footer */}
      <p className="cards-remaining">
        {cardsLeft} carte{cardsLeft !== 1 ? "s" : ""} restante{cardsLeft !== 1 ? "s" : ""}
      </p>
      {maitrePouce || maitreQuestions ? (
        <div className="maitre-bar">
          {maitrePouce ? (
            <span className="maitre-chip">👍 Maître du pouce : {maitrePouce}</span>
          ) : null}
          {maitreQuestions ? (
            <span className="maitre-chip">❓ Maître des questions : {maitreQuestions}</span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
