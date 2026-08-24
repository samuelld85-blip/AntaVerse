"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { Button } from "@/games/shared/components/ui";
import { hasEmptyName } from "@/games/shared/lib/participant-list";
import { usePlayerFields } from "@/games/shared/lib/use-player-fields";
import { createGame, MAX_PLAYERS, MIN_PLAYERS } from "@/games/fuck/lib/game/engine";
import { saveCurrentGame } from "@/games/fuck/lib/game/persistence";

const DEFAULT_PLAYER_COUNT = 3;
const ACCENT = "var(--fuck-accent)";

export function SetupForm() {
  const router = useRouter();
  const { fields, updateName, addPlayer, removePlayer, isRemovable, canAddMore } = usePlayerFields({
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    defaultCount: DEFAULT_PLAYER_COUNT,
  });
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasEmptyName(fields)) {
      setError("Chaque joueur doit avoir un nom.");
      return;
    }
    try {
      saveCurrentGame(createGame({ playerNames: fields.map((field) => field.value) }));
      router.push("/fuck/partie");
    } catch {
      setError("Impossible de préparer la partie sur cet appareil.");
    }
  }

  return (
    <form className="player-form" onSubmit={submit} noValidate>
      <div className="player-list">
        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            badge={index + 1}
            color={ACCENT}
            label={`Joueur ${index + 1}`}
            onRemove={isRemovable(index) ? () => removePlayer(field.id) : undefined}
            removeLabel={`Retirer le joueur ${index + 1}`}
            inputProps={{
              value: field.value,
              onChange: (event) => updateName(field.id, event.target.value),
              placeholder: "Son prénom",
              "aria-label": `Nom du joueur ${index + 1}`,
            }}
          />
        ))}
        <AddParticipantButton onClick={addPlayer} disabled={!canAddMore} color={ACCENT}>
          Ajouter un joueur
        </AddParticipantButton>
      </div>
      <div>
        <p className="setup-note">
          {fields.length} joueurs · {fields[0]?.value || "le premier joueur"} sera le Dealer
        </p>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <Button type="submit">
          Lancer la partie <span aria-hidden="true">→</span>
        </Button>
      </div>
    </form>
  );
}
