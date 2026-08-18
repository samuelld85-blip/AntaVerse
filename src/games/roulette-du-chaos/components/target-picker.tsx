"use client";

import { useState } from "react";
import { Button } from "@/games/shared/components/ui";
import type { PickTargetsRequest, Player } from "@/games/roulette-du-chaos/lib/game/types";

/**
 * Reusable target selector (spec §33): exactly `min`..`max` distinct
 * eligible players, duplicates impossible by construction, confirmation
 * disabled until the selection is valid. Used for every DISTRIBUE/CHOISIS/
 * TOUS/JACKPOT event that needs one or several players picked.
 */
export function TargetPicker({
  players,
  request,
  onConfirm,
}: {
  players: readonly Player[];
  request: PickTargetsRequest;
  onConfirm: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const eligible = players.filter((player) => !request.excludeIds.includes(player.id));

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((entry) => entry !== id);
      if (current.length >= request.max) return [...current.slice(1), id];
      return [...current, id];
    });
  }

  const canConfirm = selected.length >= request.min && selected.length <= request.max;
  const countHint =
    request.min === request.max
      ? `${selected.length} / ${request.max} choisi${request.max > 1 ? "s" : ""}`
      : `${selected.length} choisi${selected.length > 1 ? "s" : ""} (${request.min} à ${request.max})`;

  return (
    <div className="target-picker">
      <p className="target-picker-label">{request.label}</p>
      <div className="target-picker-grid" role="group" aria-label={request.label}>
        {eligible.map((player) => {
          const isSelected = selected.includes(player.id);
          return (
            <button
              key={player.id}
              type="button"
              className={isSelected ? "target-chip target-chip--selected" : "target-chip"}
              onClick={() => toggle(player.id)}
              aria-pressed={isSelected}
            >
              {player.name}
            </button>
          );
        })}
      </div>
      <p className="target-picker-hint">{countHint}</p>
      <Button type="button" disabled={!canConfirm} onClick={() => onConfirm(selected)}>
        Confirmer
      </Button>
    </div>
  );
}
