"use client";

import { useEffect, useRef, useState } from "react";
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

export function Wheel({
  targetCategory,
  spinning,
  onSpinEnd,
}: {
  targetCategory: CategoryId | null;
  spinning: boolean;
  onSpinEnd?: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (!spinning || !targetCategory) return;

    // Reset rotation to 0 at the start of each spin
    rotationRef.current = 0;

    const base = (360 - sectorCenterAngle(targetCategory)) % 360;
    // Since we reset to 0, currentMod is always 0
    const currentMod = 0;
    let delta = base - currentMod;
    delta = ((delta % 360) + 360) % 360;
    if (delta === 0) delta = 360;
    const next = SPIN_TURNS * 360 + delta;
    rotationRef.current = next;
    setRotation(next);
  }, [spinning, targetCategory]);

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
