"use client";

import { useState } from "react";

const FLIP_DELAY_MS = 420;

export function MysteryPicker({
  count,
  onPick,
}: {
  count: number;
  onPick: (index: number) => void;
}) {
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);

  function pick(index: number) {
    if (flippingIndex !== null) return;
    setFlippingIndex(index);
    window.setTimeout(() => onPick(index), FLIP_DELAY_MS);
  }

  return (
    <div className="mystery-picker" role="group" aria-label="Choisis une carte face cachée">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          className={
            flippingIndex === index ? "mystery-card mystery-card--flipping" : "mystery-card"
          }
          onClick={() => pick(index)}
          disabled={flippingIndex !== null}
          aria-label={`Carte ${index + 1}`}
        >
          <span aria-hidden="true">?</span>
        </button>
      ))}
    </div>
  );
}
