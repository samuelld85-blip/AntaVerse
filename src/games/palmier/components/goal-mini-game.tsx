"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP_BY_TIER = [3.25, 3.05, 2.9, 2.7, 2.55, 2.4, 2.25, 2.1, 1.95, 1.8];

/** Must match the `width` prop on the card Image below. */
const CARD_W = 100;

/** Only samples within this window contribute to velocity. */
const VELOCITY_WINDOW_MS = 100;

/** Minimum upward launch speed (px/s) — ensures slow drags still launch. */
const MIN_LAUNCH_VY = 500;

/** Hard cap on any velocity axis (px/s). */
const MAX_LAUNCH_SPEED = 5000;

/** Per-frame friction: velocity *= FRICTION^(dt*60). */
const FRICTION = 0.984;

/** Vertical speed floor once airborne (px/s) — friction may decelerate the
 *  card, but never below this, so it always keeps moving toward the goal
 *  and can never stall mid-air short of the goal line. */
const MIN_CRUISE_VY = 260;

/** Small tolerance on each edge for goal detection (px). */
const GOAL_TOLERANCE = 8;

/** Palm width sizing — must match the CSS clamp() on .plm-goal-palm-img. */
const PALM_MIN_W = 130;
const PALM_MAX_W = 180;
const PALM_VW_RATIO = 0.34;

/** A release with total pointer travel under this (px) counts as a tap,
 *  not a throw — always resolves as a miss regardless of trajectory. */
const TAP_THRESHOLD_PX = 12;

/** Fraction of the card→goal distance the player can manually drag the
 *  card up before hitting the boundary — beyond it, the card stops
 *  following the finger, though the finger's motion still counts toward
 *  the release velocity/direction. Prevents "walking" the card into the
 *  goal by hand instead of actually flicking it. */
const DRAG_LIMIT_RATIO = 0.55;

// ─── Public helpers (also used by tests) ─────────────────────────────────────

export function getGoalTier(totalCards: number, remainingCards: number): number {
  const drawn = totalCards - remainingCards;
  return Math.min(9, Math.floor(drawn / 5));
}

export function getGoalGapMultiplier(tier: number): number {
  return GAP_BY_TIER[Math.min(9, Math.max(0, tier))] ?? 1.8;
}

export function clampVelocity(vx: number, vy: number): { vx: number; vy: number } {
  const clampedVx = Math.max(-MAX_LAUNCH_SPEED, Math.min(MAX_LAUNCH_SPEED, vx));
  // vy is negative (up). Clamp between -MAX_LAUNCH_SPEED and -MIN_LAUNCH_VY.
  const clampedVy = Math.max(-MAX_LAUNCH_SPEED, Math.min(-MIN_LAUNCH_VY, vy));
  return { vx: clampedVx, vy: clampedVy };
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "dragging" | "launching" | "success" | "fail";

interface PointerSample {
  x: number;
  y: number;
  t: number;
}

interface GoalGeometry {
  innerLeft: number;   // viewport x of the right edge of the left palm div
  innerRight: number;  // viewport x of the left edge of the right palm div
  goalLine: number;    // viewport y of the bottom of the palm images
}

interface CardOrigin {
  left: number; // viewport x of card left edge when transform = translate(0,0)
  top: number;  // viewport y of card top edge when transform = translate(0,0)
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
  const [phase, setPhase] = useState<Phase>("idle");

  const cardRef = useRef<HTMLDivElement>(null);
  const leftPalmRef = useRef<HTMLDivElement>(null);
  const rightPalmRef = useRef<HTMLDivElement>(null);

  // Current card offset from natural position (maintained in refs, not state,
  // so the rAF loop can update the DOM directly without triggering re-renders).
  const posRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });

  // Pointer tracking
  const pointerOriginRef = useRef({ x: 0, y: 0 });
  const samplesRef = useRef<PointerSample[]>([]);

  // Cached geometry — measured once per idle entry (palms don't move mid-turn).
  const goalRef = useRef<GoalGeometry | null>(null);
  const cardOriginRef = useRef<CardOrigin | null>(null);

  // Most negative posRef.y the player can manually drag to (px) before the
  // boundary kicks in. Computed fresh at each pointerdown from real geometry.
  const dragLimitYRef = useRef<number | null>(null);
  // A release counted as a tap (see TAP_THRESHOLD_PX) always misses,
  // regardless of where the forced default toss happens to land.
  const forcedFailRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const resolvedRef = useRef(false);

  // ─── Difficulty ───────────────────────────────────────────────────────────
  const tier = getGoalTier(totalCards, remainingCards);
  const rawGap = CARD_W * getGoalGapMultiplier(tier);
  // Bound the gap so palmWidth + gap + palmWidth never exceeds the screen —
  // palmWidthPx mirrors the CSS clamp() on .plm-goal-palm-img exactly, so
  // this stays in sync with what's actually rendered.
  const screenW = typeof window !== "undefined" ? window.innerWidth : 390;
  const palmWidthPx = Math.min(PALM_MAX_W, Math.max(PALM_MIN_W, screenW * PALM_VW_RATIO));
  const maxGapForScreen = Math.max(60, screenW - palmWidthPx * 2 - 24);
  const gapPx = Math.min(rawGap, maxGapForScreen);

  // ─── Cleanup rAF on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─── Measure geometry when returning to idle ──────────────────────────────
  useEffect(() => {
    if (phase !== "idle") return;
    const id = window.setTimeout(() => {
      const lRect = leftPalmRef.current?.getBoundingClientRect();
      const rRect = rightPalmRef.current?.getBoundingClientRect();
      const cRect = cardRef.current?.getBoundingClientRect();
      if (lRect && rRect) {
        goalRef.current = {
          innerLeft: lRect.right,
          innerRight: rRect.left,
          goalLine: Math.max(lRect.bottom, rRect.bottom),
        };
      }
      if (cRect) {
        cardOriginRef.current = { left: cRect.left, top: cRect.top };
      }
    }, 60);
    return () => window.clearTimeout(id);
  }, [phase]);

  // ─── DOM helpers (imperative, bypass React re-renders for animation) ──────
  function applyCardTransform(x: number, y: number, transition = "none") {
    if (!cardRef.current) return;
    cardRef.current.style.transition = transition;
    cardRef.current.style.transform = `translate(${x}px, ${y}px)`;
  }

  function applyCardOpacity(opacity: string, transition = "none") {
    if (!cardRef.current) return;
    if (transition !== "none") cardRef.current.style.transition = transition;
    cardRef.current.style.opacity = opacity;
  }

  function resetCard(animated = false) {
    posRef.current = { x: 0, y: 0 };
    applyCardOpacity("1");
    applyCardTransform(
      0,
      0,
      animated ? "transform 380ms cubic-bezier(0.22,1,0.36,1)" : "none",
    );
  }

  // ─── rAF launch loop ──────────────────────────────────────────────────────
  const startLaunch = useCallback(
    (vx: number, vy: number) => {
      velRef.current = { x: vx, y: vy };
      resolvedRef.current = false;

      let lastTime: number | null = null;

      const frame = (now: number) => {
        if (lastTime === null) {
          lastTime = now;
          rafRef.current = requestAnimationFrame(frame);
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        const frictionFactor = Math.pow(FRICTION, dt * 60);
        velRef.current.x *= frictionFactor;
        velRef.current.y *= frictionFactor;
        // Never let the upward speed decay below the cruise floor — the
        // card must always keep advancing toward the goal line and can
        // never stall short of it, no matter how weak the initial flick.
        if (velRef.current.y > -MIN_CRUISE_VY) velRef.current.y = -MIN_CRUISE_VY;

        posRef.current.x += velRef.current.x * dt;
        posRef.current.y += velRef.current.y * dt;

        applyCardTransform(posRef.current.x, posRef.current.y);

        if (!resolvedRef.current && goalRef.current && cardOriginRef.current) {
          const { innerLeft, innerRight, goalLine } = goalRef.current;
          const { left: initLeft, top: initTop } = cardOriginRef.current;

          const cardLeft = initLeft + posRef.current.x;
          const cardRight = cardLeft + CARD_W;
          const cardTop = initTop + posRef.current.y;

          if (cardTop < goalLine) {
            // Card has crossed the goal line — evaluate success or fail
            resolvedRef.current = true;
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

            const fits =
              !forcedFailRef.current &&
              cardLeft >= innerLeft - GOAL_TOLERANCE &&
              cardRight <= innerRight + GOAL_TOLERANCE;

            if (fits) {
              setPhase("success");
              // Card is already at the goal base — move a tiny bit further so
              // the pass is visible, then stop (no overshooting past the palms).
              applyCardTransform(
                posRef.current.x,
                posRef.current.y - 28,
                "transform 280ms ease-out",
              );
              window.setTimeout(() => onResolved(false), 600);
            } else {
              setPhase("fail");
              // Snap back partially and fade
              applyCardTransform(
                posRef.current.x * 0.15,
                posRef.current.y * 0.25,
                "transform 350ms cubic-bezier(0.22,0,0.36,1), opacity 350ms ease",
              );
              applyCardOpacity("0.35");
              window.setTimeout(() => onResolved(true), 1100);
            }
            return;
          }

          // Card flew completely off-screen without passing the goal → fail
          const wH = window.innerHeight;
          const wW = window.innerWidth;
          if (cardTop < -200 || cardLeft > wW + 150 || cardRight < -150) {
            resolvedRef.current = true;
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            setPhase("fail");
            window.setTimeout(() => onResolved(true), 1100);
            return;
          }
        }

        rafRef.current = requestAnimationFrame(frame);
      };

      rafRef.current = requestAnimationFrame(frame);
    },
    [onResolved],
  );

  // ─── Pointer handlers ─────────────────────────────────────────────────────

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "idle" || resolvedRef.current) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      // Grab exactly where the card currently is — do NOT snap/reset its
      // transform first. Resetting to translate(0,0) before measuring was
      // never actually what caused cards to jump (posRef is already {0,0}
      // at rest, so the reset was a no-op in the common case); the real
      // culprit was elsewhere (see .plm-goal-hand/.plm-goal-help below).
      // Still: stop any in-flight CSS transition so it can't fight the
      // drag, then derive the "rest" origin from wherever the card
      // ACTUALLY is right now (rect minus whatever offset is currently
      // applied) — correct even mid-animation, e.g. a fast re-tap right
      // after a pointercancel snap-back.
      if (cardRef.current) {
        cardRef.current.style.transition = "none";
        const cRect = cardRef.current.getBoundingClientRect();
        cardOriginRef.current = {
          left: cRect.left - posRef.current.x,
          top: cRect.top - posRef.current.y,
        };
      }

      // Refresh goal geometry synchronously too (not just on the idle-entry
      // timer), so the drag limit below and later goal-line detection are
      // always based on up-to-date measurements.
      const lRect = leftPalmRef.current?.getBoundingClientRect();
      const rRect = rightPalmRef.current?.getBoundingClientRect();
      if (lRect && rRect) {
        goalRef.current = {
          innerLeft: lRect.right,
          innerRight: rRect.left,
          goalLine: Math.max(lRect.bottom, rRect.bottom),
        };
      }

      // Cap how far the player can manually drag the card up — beyond this,
      // dragging further doesn't move it (see onPointerMove), so reaching
      // the goal always requires an actual flick, not just walking the
      // card up by hand.
      if (cardOriginRef.current && goalRef.current) {
        const totalUpDistance = cardOriginRef.current.top - goalRef.current.goalLine;
        dragLimitYRef.current = -Math.max(40, totalUpDistance * DRAG_LIMIT_RATIO);
      } else {
        dragLimitYRef.current = null;
      }

      posRef.current = { x: 0, y: 0 };
      pointerOriginRef.current = { x: e.clientX, y: e.clientY };
      samplesRef.current = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
      forcedFailRef.current = false;

      setPhase("dragging");
    },
    [phase],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "dragging") return;

      // Delta-based drag: transform = pointerNow - pointerAtGrab. This is
      // algebraically identical to the classic "grabOffset" formula
      // (newLeft = pointerX - (pointerX0 - cardRect.left)) — the point of
      // the card under the finger at pointerdown stays under the finger for
      // the whole gesture, it's just expressed as a running delta instead
      // of an absolute left/top.
      const dx = e.clientX - pointerOriginRef.current.x;
      // Allow free horizontal movement, but only upward vertical
      let dy = Math.min(0, e.clientY - pointerOriginRef.current.y);
      // Beyond the drag limit, the card stops following the finger — but
      // the finger's real position is still recorded in samplesRef below,
      // so a flick that blows past the boundary still launches at full
      // speed in that same direction once released.
      if (dragLimitYRef.current !== null) {
        dy = Math.max(dy, dragLimitYRef.current);
      }

      posRef.current = { x: dx, y: dy };
      applyCardTransform(dx, dy);

      // Rolling sample window for velocity
      const now = e.timeStamp;
      samplesRef.current = [
        ...samplesRef.current.filter((s) => now - s.t < VELOCITY_WINDOW_MS),
        { x: e.clientX, y: e.clientY, t: now },
      ];
    },
    [phase],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "dragging") return;

      // A tap (negligible total finger travel) is always a miss — it
      // never gets a "lucky" straight-up shot through the gap.
      const totalTravel = Math.hypot(
        e.clientX - pointerOriginRef.current.x,
        e.clientY - pointerOriginRef.current.y,
      );
      const isTap = totalTravel < TAP_THRESHOLD_PX;
      forcedFailRef.current = isTap;

      let vx: number;
      let vy: number;

      if (isTap) {
        // Skip the (unstable, near-zero-dt) velocity computation for taps —
        // just give it a small, consistent default toss to animate.
        vx = 0;
        vy = -MIN_LAUNCH_VY;
      } else {
        const samples = samplesRef.current;
        let rawVx = 0;
        let rawVy = -MIN_LAUNCH_VY;

        if (samples.length >= 2) {
          const first = samples[0]!;
          const last = samples[samples.length - 1]!;
          const dt = (last.t - first.t) / 1000;
          if (dt > 0.005) {
            rawVx = (last.x - first.x) / dt;
            rawVy = (last.y - first.y) / dt;
          }
        }

        ({ vx, vy } = clampVelocity(rawVx, rawVy));
      }

      setPhase("launching");
      startLaunch(vx, vy);
    },
    [phase, startLaunch],
  );

  const onPointerCancel = useCallback(() => {
    if (phase !== "dragging") return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    samplesRef.current = [];
    resetCard(true);
    setPhase("idle");
  // resetCard reads cardRef but doesn't need to be in deps (stable ref)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ─── Render ───────────────────────────────────────────────────────────────

  const isInteractive = phase === "idle";
  const isLocked = phase === "success" || phase === "fail" || phase === "launching";

  return (
    <section className="plm-goal-stage">
      {/* ── Top info bar: player, counter, badges ── */}
      <p className="current-player-label">Au tour de</p>
      <h1 className="current-player-name">{playerName}</h1>
      <p className="cards-remaining">
        {cardsLeft} carte{cardsLeft !== 1 ? "s" : ""} restante
        {cardsLeft !== 1 ? "s" : ""}
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

      {/* ── Goal zone: big palms as goal posts, right below badges.
          Flex row + gap gives both palms one shared box model (identical
          size) and gap is the exact px distance between their inner edges —
          the same value the engine reads for goal-line validation. ── */}
      <div
        className="plm-goal-zone"
        style={{ "--plm-gap": `${gapPx}px` } as React.CSSProperties}
      >
        <div className="plm-goal-palm" ref={leftPalmRef}>
          <Image
            src="/games/palmier/goal/palm-left.png"
            alt="But — palmier gauche"
            width={180}
            height={180}
            className="plm-goal-palm-img"
          />
        </div>
        <div className="plm-goal-palm" ref={rightPalmRef}>
          <Image
            src="/games/palmier/goal/palm-right.png"
            alt="But — palmier droit"
            width={180}
            height={180}
            className="plm-goal-palm-img"
          />
        </div>
      </div>

      {/* ── Flight zone: absorbs vertical space between palms and card,
          pushing the card to the bottom. The arrow lives here, anchored to
          its bottom edge, spanning 80% of the available height so it nearly
          bridges card → goal without touching the palms. The dashed
          boundary marks how far the card can be manually dragged (see
          DRAG_LIMIT_RATIO) — only visible while actively dragging. ── */}
      <div
        className="plm-goal-flight-zone"
        aria-hidden="true"
        style={{ "--plm-drag-limit": `${DRAG_LIMIT_RATIO * 100}%` } as React.CSSProperties}
      >
        <div
          className="plm-goal-lane"
          style={{ opacity: isLocked ? 0.15 : 0.9 }}
        >
          <Image
            src="/games/palmier/goal/goal-lane.png"
            alt=""
            width={140}
            height={140}
            style={{ height: "100%", width: "auto" }}
          />
        </div>
        <div
          className={`plm-goal-drag-limit${phase === "dragging" ? " plm-goal-drag-limit--visible" : ""}`}
        />
      </div>

      {/* ── Bottom zone: card → hand → help.
          .plm-goal-hand and .plm-goal-help stay mounted at ALL times and
          toggle via an opacity modifier class instead of conditional
          rendering — see the CSS comment on .plm-goal-hand for why: an
          unmount/remount here used to change .plm-goal-bottom's height and
          make the card visibly jump the instant a drag started. ── */}
      <div className="plm-goal-bottom">
        {/* Draggable card. The fail message is an absolute overlay anchored
            to this wrapper (not an in-flow sibling) for the same reason. */}
        <div className="plm-goal-card-area">
          {phase === "fail" ? (
            <p className="plm-goal-fail-msg" aria-live="polite">
              Raté : +1 gorgée
            </p>
          ) : null}
          <div
            className={`plm-goal-card${isInteractive ? " plm-goal-card--idle" : ""}`}
            ref={cardRef}
            onPointerDown={isLocked ? undefined : onPointerDown}
            onPointerMove={isLocked ? undefined : onPointerMove}
            onPointerUp={isLocked ? undefined : onPointerUp}
            onPointerCancel={isLocked ? undefined : onPointerCancel}
            aria-label="Carte à lancer"
          >
            <Image
              src="/games/palmier/goal/card-back.png"
              alt="Carte face cachée"
              width={CARD_W}
              height={140}
              style={{
                width: CARD_W,
                height: "auto",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
              priority
            />
          </div>
        </div>

        <div
          className={`plm-goal-hand${isInteractive ? "" : " plm-goal-hand--hidden"}`}
          aria-hidden="true"
        >
          <Image
            src="/games/palmier/goal/swipe-hand.png"
            alt=""
            width={36}
            height={36}
            style={{ width: 36, height: "auto" }}
          />
        </div>

        <div className={`plm-goal-help${isInteractive ? "" : " plm-goal-help--hidden"}`}>
          <p>Fais glisser la carte entre les deux palmiers</p>
          <p>L&apos;écart rétrécit au fil de la partie</p>
        </div>
      </div>
    </section>
  );
}
