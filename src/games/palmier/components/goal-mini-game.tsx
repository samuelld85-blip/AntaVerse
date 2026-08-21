"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Constants ────────────────────────────────────────────────────────────────

// Wider at tier 0 (much easier), much tighter at tier 9 (much harder) — visible
// progression from "plenty of room" to "requires precision". This curve was flattened
// too much on narrow phones; interpolation in JS and CSS sizing keeps it visible.
const GAP_BY_TIER = [3.75, 3.5, 3.2, 2.85, 2.6, 2.35, 2.1, 1.85, 1.6, 1.35];

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

/** Palm width sizing — must match the CSS clamp() on .plm-goal-palm-img.
 *  There is deliberately no hard minimum here beyond PALM_SIZE_FLOOR: on a
 *  narrow phone, two big palms can eat nearly the whole screen width,
 *  leaving no room for the gap to visibly vary between tiers (or even to
 *  fit without overflowing). Palm width is capped below by how much room
 *  the gap needs (see PALM_SIZING_GAP_RESERVE), not by a fixed floor. */
const PALM_SIZE_FLOOR = 70; // pure sanity minimum, only relevant on pathologically narrow screens
const PALM_MAX_W = 180;
const PALM_VW_RATIO = 0.34;

/** The palm PNGs have substantial transparent padding around the trunk
 *  artwork (measured with sharp against the actual asset files: canvas
 *  1254×1254, visible content x:[308,946] y:[145,1108]). The raw box
 *  edges (getBoundingClientRect) are NOT the trunk's visible edges — goal
 *  validation and the debug dots use the real trunk position, not the
 *  padded canvas edges. Both assets are (now) the same artwork mirrored.
 *
 *  For LEFT palm: trunk's right edge (inner edge of gap) is at x=946 → 946/1254 = 0.7544
 *  For RIGHT palm: trunk's left edge (inner edge of gap) is at x=307 → 307/1254 = 0.2447
 *  For both: trunk base is at y=1108 → 1108/1254 = 0.8835
 */
const PALM_LEFT_INNER_FRACTION = 0.7544;  // RIGHT palm's inner edge (left edge of trunk)
const PALM_RIGHT_INNER_FRACTION = 0.2447; // LEFT palm's inner edge (left edge of trunk)
const PALM_BOTTOM_FRACTION = 0.8835; // trunk base sits this far down the box

/** A release with total pointer travel under this (px) counts as a tap,
 *  not a throw — always resolves as a miss regardless of trajectory. */
const TAP_THRESHOLD_PX = 12;

/** Fraction of the card→goal distance the player can manually drag the
 *  card up before the throw auto-releases (see onPointerMove) — keeps the
 *  outcome dependent on an actual flick, not on walking the card up by hand.
 *  Reduced from 0.42 to 0.32 to trigger auto-release sooner and reduce the
 *  time players spend near the boundary. */
const DRAG_LIMIT_RATIO = 0.32;

/** The hardest tier's gap must never be smaller than this, or the card
 *  (CARD_W wide) could never geometrically fit through it. Tier 9 now
 *  targets 135px (1.35× CARD_W), so this floor at 100px (1.0× CARD_W)
 *  forces genuine challenge in the endgame. */
const MIN_PLAYABLE_GAP = CARD_W * 1.0;
/** Palm sizing always leaves at least this much room for the gap — bigger
 *  than MIN_PLAYABLE_GAP so the easiest tier still has visible headroom
 *  above the hardest one instead of both collapsing to the same floor. */
const PALM_SIZING_GAP_RESERVE = CARD_W * 1.7;
/** Total horizontal breathing room reserved outside the two palms + gap. */
const SCREEN_MARGIN = 16;

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
  // Debug markers: exact viewport point read for each palm's inner base —
  // lets you visually confirm the goal geometry lines up with the artwork.
  const [goalMarkers, setGoalMarkers] = useState<{
    left: { x: number; y: number };
    right: { x: number; y: number };
  } | null>(null);

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
  const screenW = typeof window !== "undefined" ? window.innerWidth : 390;

  // Palm width is sized DOWNWARD from the screen, not the other way around:
  // it's whatever fits PALM_VW_RATIO / PALM_MAX_W, but never so large that
  // it would leave less than PALM_SIZING_GAP_RESERVE of room for the gap.
  // (A fixed minimum palm width, tried earlier, caused both overflow AND a
  // frozen-looking gap on narrow phones — see PALM_SIZE_FLOOR's comment.)
  // .plm-goal-palm-img's CSS clamp() must mirror this so JS and CSS agree
  // on the rendered size.
  const maxPalmWidthForScreen = (screenW - SCREEN_MARGIN - PALM_SIZING_GAP_RESERVE) / 2;
  const palmWidthPx = Math.max(
    PALM_SIZE_FLOOR,
    Math.min(PALM_MAX_W, screenW * PALM_VW_RATIO, maxPalmWidthForScreen),
  );

  // On a wide screen there's room for the full 3.25x → 1.8x tier curve as
  // designed. On a narrow phone, two big palms can eat most of the width,
  // leaving too little room for that whole range — naively clamping every
  // tier's gap to whatever's left collapses ALL tiers to the same constant
  // the moment tier 0 alone overflows, which is why the palms previously
  // stopped visibly moving as the game progressed. Instead, interpolate:
  // tier 0 gets as much of its intended gap as fits the screen, tier 9
  // always keeps MIN_PLAYABLE_GAP (the card must be able to physically fit
  // through it, always), and every tier in between is mapped proportionally
  // onto whatever room exists between those two endpoints — so the palms
  // keep moving at every tier, at every screen size.
  const rawGapAtEasiestTier = CARD_W * getGoalGapMultiplier(0);
  const rawGapAtHardestTier = CARD_W * getGoalGapMultiplier(9);
  const maxGapForScreen = Math.max(
    MIN_PLAYABLE_GAP,
    screenW - palmWidthPx * 2 - SCREEN_MARGIN,
  );
  const easiestGapPx = Math.min(rawGapAtEasiestTier, maxGapForScreen);
  const hardestGapPx = MIN_PLAYABLE_GAP;
  const tierFraction =
    (CARD_W * getGoalGapMultiplier(tier) - rawGapAtHardestTier) /
    (rawGapAtEasiestTier - rawGapAtHardestTier);
  const gapPx = hardestGapPx + tierFraction * (easiestGapPx - hardestGapPx);

  // ─── Cleanup rAF on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Reads the two palms' real rendered geometry and updates both goalRef
  // (used by the engine for success/fail detection) and the on-screen debug
  // dots — a single source of truth so the dots always show exactly what
  // the detection logic is actually using.
  function measureGoal() {
    const lRect = leftPalmRef.current?.getBoundingClientRect();
    const rRect = rightPalmRef.current?.getBoundingClientRect();
    if (!lRect || !rRect) return;
    // Use the real trunk edges (measured from the artwork itself), not the
    // padded canvas box — see PALM_LEFT_INNER_FRACTION, PALM_RIGHT_INNER_FRACTION.
    const innerLeft = lRect.left + lRect.width * PALM_LEFT_INNER_FRACTION;
    const innerRight = rRect.left + rRect.width * PALM_RIGHT_INNER_FRACTION;
    const goalLine = Math.max(
      lRect.top + lRect.height * PALM_BOTTOM_FRACTION,
      rRect.top + rRect.height * PALM_BOTTOM_FRACTION,
    );
    goalRef.current = {
      innerLeft,
      innerRight,
      goalLine,
    };
    setGoalMarkers({
      left: { x: innerLeft, y: goalLine },
      right: { x: innerRight, y: goalLine },
    });
  }

  // ─── Measure geometry when returning to idle ──────────────────────────────
  useEffect(() => {
    if (phase !== "idle") return;
    const id = window.setTimeout(() => {
      measureGoal();
      const cRect = cardRef.current?.getBoundingClientRect();
      if (cRect) {
        cardOriginRef.current = { left: cRect.left, top: cRect.top };
      }
    }, 60);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              // Card always flies at least to the goal line to show the attempt,
              // then snaps back and fades — even failed attempts reach the palms.
              const goalLineRelativeY = goalLine - initTop;
              applyCardTransform(
                posRef.current.x,
                goalLineRelativeY - 25,  // Stop 25px short of goal line
                "transform 280ms ease-out",
              );
              window.setTimeout(() => {
                // Then snap back and fade
                applyCardTransform(
                  posRef.current.x * 0.15,
                  posRef.current.y * 0.25,
                  "transform 350ms cubic-bezier(0.22,0,0.36,1), opacity 350ms ease",
                );
                applyCardOpacity("0.35");
              }, 280);
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
      measureGoal();

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

  // Shared by a normal pointerup release AND a boundary-triggered
  // auto-release (see onPointerMove) — computes velocity from the recent
  // pointer samples (or forces a fail for a tap) and starts the throw.
  const releaseAndLaunch = useCallback(
    (clientX: number, clientY: number) => {
      // A tap (negligible total finger travel) is always a miss — it
      // never gets a "lucky" straight-up shot through the gap.
      const totalTravel = Math.hypot(
        clientX - pointerOriginRef.current.x,
        clientY - pointerOriginRef.current.y,
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
    [startLaunch],
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
      const rawDy = Math.min(0, e.clientY - pointerOriginRef.current.y);

      // Record the sample BEFORE checking the boundary, so a boundary-
      // triggered release below still reflects the motion right up to it.
      const now = e.timeStamp;
      samplesRef.current = [
        ...samplesRef.current.filter((s) => now - s.t < VELOCITY_WINDOW_MS),
        { x: e.clientX, y: e.clientY, t: now },
      ];

      // Crossing the drag-limit boundary (dashed yellow line) auto-releases
      // the card right there — exactly as if the finger had lifted at that
      // point — instead of pinning the card at the line while still
      // tracking the finger. This is what actually prevents "walking" the
      // card up to the goal by hand: past the line, dragging further does
      // nothing except end the drag.
      if (dragLimitYRef.current !== null && rawDy < dragLimitYRef.current) {
        posRef.current = { x: dx, y: dragLimitYRef.current };
        applyCardTransform(dx, dragLimitYRef.current);
        releaseAndLaunch(e.clientX, e.clientY);
        return;
      }

      posRef.current = { x: dx, y: rawDy };
      applyCardTransform(dx, rawDy);
    },
    [phase, releaseAndLaunch],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "dragging") return;
      releaseAndLaunch(e.clientX, e.clientY);
    },
    [phase, releaseAndLaunch],
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

      {/* Debug markers: the exact viewport point (base of each palm's inner
          edge) the engine reads for goal validation — lets you visually
          confirm it's aligned with the artwork. Remove once verified. */}
      {goalMarkers ? (
        <>
          <div
            className="plm-goal-debug-dot"
            style={{ left: goalMarkers.left.x, top: goalMarkers.left.y }}
            aria-hidden="true"
          />
          <div
            className="plm-goal-debug-dot"
            style={{ left: goalMarkers.right.x, top: goalMarkers.right.y }}
            aria-hidden="true"
          />
        </>
      ) : null}
    </section>
  );
}
