"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { createGame, MAX_PLAYERS, MIN_PLAYERS } from "@/games/palmier/lib/game/engine";
import { saveCurrentGame } from "@/games/palmier/lib/game/persistence";

const DEFAULT_PLAYER_COUNT = 3;

interface PlayerField {
  id: number;
  value: string;
}

export function SetupForm() {
  const router = useRouter();
  const nextId = useRef(DEFAULT_PLAYER_COUNT);
  const [fields, setFields] = useState<PlayerField[]>(() =>
    Array.from({ length: DEFAULT_PLAYER_COUNT }, (_, index) => ({ id: index, value: "" })),
  );
  const [error, setError] = useState<string | null>(null);

  function updateName(id: number, value: string) {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, value } : field)));
  }

  function addPlayer() {
    if (fields.length >= MAX_PLAYERS) return;
    setFields((current) => [...current, { id: nextId.current++, value: "" }]);
  }

  function removePlayer(id: number) {
    if (fields.length <= MIN_PLAYERS) return;
    setFields((current) => current.filter((field) => field.id !== id));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedNames = fields.map((field) => field.value.trim());

    if (trimmedNames.some((name) => name.length === 0)) {
      setError("Chaque joueur doit avoir un nom.");
      return;
    }

    try {
      const game = createGame({ playerNames: trimmedNames });
      saveCurrentGame(game);
      router.push("/palmier/partie");
    } catch {
      setError("Impossible de préparer la partie sur cet appareil.");
    }
  }

  return (
    <form className="player-form" onSubmit={submit} noValidate>
      <div className="player-fields">
        {fields.map((field, index) => (
          <div className="player-field" key={field.id}>
            <span className="player-number" aria-hidden="true">
              {index + 1}
            </span>
            <span className="player-input-wrap">
              <span className="player-label">Joueur {index + 1}</span>
              <input
                value={field.value}
                onChange={(event) => updateName(field.id, event.target.value)}
                maxLength={24}
                autoComplete="off"
                aria-label={`Nom du joueur ${index + 1}`}
                placeholder="Son prénom"
              />
            </span>
            {fields.length > MIN_PLAYERS ? (
              <button
                type="button"
                className="player-remove-button"
                onClick={() => removePlayer(field.id)}
                aria-label={`Retirer le joueur ${index + 1}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {fields.length < MAX_PLAYERS ? (
        <button type="button" className="add-player-button" onClick={addPlayer}>
          <span aria-hidden="true">+</span> Ajouter un joueur
        </button>
      ) : null}

      <p className="setup-note">
        {MIN_PLAYERS} à {MAX_PLAYERS} joueurs · l’ordre entré ici sera celui de la partie
      </p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">
        Planter le palmier <span aria-hidden="true">→</span>
      </Button>
    </form>
  );
}
