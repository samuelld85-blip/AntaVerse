"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/games/roulette-du-chaos/lib/game/wheel";
import type { CategoryId } from "@/games/roulette-du-chaos/lib/game/types";

// The wheel keeps 8 visually equal sectors (spec §8 explicitly allows this
// when it's the more robust implementation) — the weighted probability
// table lives entirely in wheel.ts and only ever affects which category is
// picked, never how the sectors are drawn. The category is decided by the
// engine before this component ever animates (see spinWheel/engine.ts): the
// wheel only ever plays catch-up to an already-known result.

const SECTOR_ANGLE = 360 / CATEGORIES.length;
const SPIN_TURNS = 4;

function sectorCenterAngle(id: CategoryId): number {
  const index = CATEGORIES.findIndex((category) => category.id === id);
  return index * SECTOR_ANGLE + SECTOR_ANGLE / 2;
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
    const base = (360 - sectorCenterAngle(targetCategory)) % 360;
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    let delta = base - currentMod;
    delta = ((delta % 360) + 360) % 360;
    if (delta === 0) delta = 360;
    const next = rotationRef.current + SPIN_TURNS * 360 + delta;
    rotationRef.current = next;
    setRotation(next);
  }, [spinning, targetCategory]);

  return (
    <div className="wheel-wrap">
      <div className="wheel-pointer" aria-hidden="true" />
      <div
        className={spinning ? "wheel-disc wheel-disc--spinning" : "wheel-disc"}
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={() => {
          if (spinning) onSpinEnd?.();
        }}
      >
        {CATEGORIES.map((category, index) => {
          const angle = index * SECTOR_ANGLE + SECTOR_ANGLE / 2;
          return (
            <div
              key={category.id}
              className={`wheel-sector wheel-sector--${category.id.toLowerCase()}`}
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="wheel-sector-content" style={{ transform: `rotate(${-angle}deg)` }}>
                <span className="wheel-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="wheel-label">{category.label}</span>
              </div>
            </div>
          );
        })}
        <div className="wheel-hub" aria-hidden="true">
          <span>🎡</span>
        </div>
      </div>
    </div>
  );
}
