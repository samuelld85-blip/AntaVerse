"use client";

import { CATEGORIES } from "@/games/roulette-du-chaos/lib/game/wheel";
import type { CategoryId } from "@/games/roulette-du-chaos/lib/game/types";
import Image from "next/image";

// The wheel uses a pre-rendered PNG artwork with 8 equal 45° segments.
// PNG orientation: JACKPOT is centered at 0° (top), and segments proceed
// clockwise (DISTRIBUE at 45°, SUBIS at 90°, etc.).
// The pointer is fixed at the top. The PNG rotates to position the winning
// segment's center exactly under the pointer.

const SEGMENT_ANGLE = 360 / CATEGORIES.length;
const SPIN_TURNS = 4;
// Pointer aims at the center of each segment, offset slightly counterclockwise
// to hit the middle of the segment, not the border
const POINTER_OFFSET_DEG = -SEGMENT_ANGLE / 2; // -22.5° to correct alignment

function sectorCenterAngle(id: CategoryId): number {
  const index = CATEGORIES.findIndex((category) => category.id === id);
  // Each segment center offset to ensure pointer lands at correct segment center
  return index * SEGMENT_ANGLE + POINTER_OFFSET_DEG;
}

function targetRotation(id: CategoryId): number {
  const base = (360 - sectorCenterAngle(id)) % 360;
  const delta = base === 0 ? 360 : base;
  return SPIN_TURNS * 360 + delta;
}

export function Wheel({
  targetCategory,
  spinning,
  onSpinEnd,
}: {
  targetCategory: CategoryId | null;
  spinning: boolean;
  onSpinEnd?: () => void;
}) {
  const rotation = targetCategory ? targetRotation(targetCategory) : 0;

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true" />
      <div
        className={spinning ? "wheel-artwork-container wheel-artwork-container--spinning" : "wheel-artwork-container"}
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={() => {
          if (spinning) onSpinEnd?.();
        }}
      >
        <Image
          src="/brand/games/roulette_du_chaos.png"
          alt=""
          fill
          priority
          quality={95}
          className="wheel-artwork"
        />
      </div>
    </div>
  );
}
