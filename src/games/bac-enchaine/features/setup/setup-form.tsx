"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { Button } from "@/games/shared/components/ui";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { hasEmptyName } from "@/games/shared/lib/participant-list";
import { usePlayerFields } from "@/games/shared/lib/use-player-fields";
import { createGame, MAX_PLAYERS, MIN_PLAYERS } from "@/games/bac-enchaine/lib/game/engine";
import { saveCurrentGame } from "@/games/bac-enchaine/lib/game/persistence";

const ACCENT = "var(--bac-accent)";

export function SetupForm() {
  const router = useRouter();
  const { fields, updateName, addPlayer, removePlayer, isRemovable, canAddMore } = usePlayerFields({
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    defaultCount: 4,
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
      router.push("/bac-enchaine/partie");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de préparer la partie.");
    }
  }

  return (
    <form className="player-form one-shot-player-form" onSubmit={submit} noValidate>
      <div className="player-fields one-shot-player-fields">
        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            badge={index + 1}
            color={ACCENT}
            label={`Joueur ${index + 1}`}
            onRemove={isRemovable(index) ? () => removePlayer(field.id) : undefined}
            removeLabel={`Retirer le joueur ${index + 1}`}
            inputProps={{
              id: `bac-player-${index + 1}`,
              value: field.value,
              onChange: (event) => updateName(field.id, event.target.value),
              placeholder: "Son prénom",
              "aria-label": `Nom du joueur ${index + 1}`,
            }}
          />
        ))}
      </div>

      {canAddMore ? (
        <AddParticipantButton onClick={addPlayer} color={ACCENT}>
          Ajouter un joueur
        </AddParticipantButton>
      ) : null}

      <p className="setup-note">
        {MIN_PLAYERS} à {MAX_PLAYERS} joueurs · 8 manches · un seul téléphone
      </p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">
        Lancer la partie <span aria-hidden="true">→</span>
      </Button>
    </form>
  );
}
