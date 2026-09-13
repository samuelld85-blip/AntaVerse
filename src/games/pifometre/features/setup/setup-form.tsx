"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { usePlayerFields } from "@/games/shared/lib/use-player-fields";
import { hasEmptyName } from "@/games/shared/lib/participant-list";
import { questions } from "@/games/pifometre/data/questions";
import { createGame, MAX_PLAYERS, MIN_PLAYERS } from "@/games/pifometre/lib/game/engine";
import { saveCurrentGame } from "@/games/pifometre/lib/game/persistence";
import type { PlayMode } from "@/games/pifometre/lib/game/types";

const DEFAULT_PLAYER_COUNT = 3;

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>("quick");
  const { fields, updateName, addPlayer, removePlayer, isRemovable, canAddMore } = usePlayerFields({
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    defaultCount: DEFAULT_PLAYER_COUNT,
  });

  function handleModeKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) return;
    event.preventDefault();
    setPlayMode((current) => (current === "quick" ? "turns" : "quick"));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasEmptyName(fields)) {
      setError("Chaque joueur doit avoir un nom.");
      return;
    }
    try {
      saveCurrentGame(
        createGame({ playerNames: fields.map((field) => field.value.trim()), playMode }, questions),
      );
      router.push("/pifometre/partie");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Impossible de préparer la partie.",
      );
    }
  }

  return (
    <form className="team-form" onSubmit={submit} noValidate>
      <fieldset className="pifometre-mode-fieldset">
        <legend>Comment vous répondez ?</legend>
        <div className="pifometre-mode-switch" role="radiogroup" aria-label="Mode de jeu">
          <button
            type="button"
            role="radio"
            tabIndex={playMode === "quick" ? 0 : -1}
            aria-checked={playMode === "quick"}
            className={playMode === "quick" ? "is-selected" : ""}
            onClick={() => setPlayMode("quick")}
            onKeyDown={handleModeKeyDown}
          >
            <strong>Mode rapide</strong>
            <span>Réponses à l’oral</span>
          </button>
          <button
            type="button"
            role="radio"
            tabIndex={playMode === "turns" ? 0 : -1}
            aria-checked={playMode === "turns"}
            className={playMode === "turns" ? "is-selected" : ""}
            onClick={() => setPlayMode("turns")}
            onKeyDown={handleModeKeyDown}
          >
            <strong>Tour par tour</strong>
            <span>Estimations privées</span>
          </button>
        </div>
        <p className="mode-help">
          {playMode === "quick"
            ? "Tout le monde répond dans la vraie vie, puis vous tranchez ensemble."
            : "Le téléphone passe à chacun pour saisir son estimation sans la montrer."}
        </p>
      </fieldset>
      <div className="player-fields one-shot-player-fields pifometre-player-fields">
        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            badge={index + 1}
            color="var(--pifometre-accent)"
            label={`Joueur ${index + 1}`}
            onRemove={isRemovable(index) ? () => removePlayer(field.id) : undefined}
            removeLabel={`Retirer le joueur ${index + 1}`}
            inputProps={{
              id: `pifometre-player-${index + 1}`,
              value: field.value,
              onChange: (event) => updateName(field.id, event.target.value),
              placeholder: "Son prénom",
              "aria-label": `Nom du joueur ${index + 1}`,
            }}
          />
        ))}
      </div>
      {canAddMore ? (
        <AddParticipantButton onClick={addPlayer} color="var(--pifometre-accent)">
          Ajouter un joueur
        </AddParticipantButton>
      ) : null}
      <p className="setup-note">8 questions · exact : +2 · plus proche : +1</p>
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
