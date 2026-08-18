"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { MAX_PLAYERS, MIN_PLAYERS, createGame } from "@/games/purple/lib/game/engine";
import { saveCurrentGame } from "@/games/purple/lib/game/persistence";

const DEFAULT_PLAYER_COUNT = 3;

export function SetupForm() {
  const router = useRouter();
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: DEFAULT_PLAYER_COUNT }, () => ""),
  );
  const [error, setError] = useState<string | null>(null);

  function updateName(index: number, value: string) {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  }

  function addPlayer() {
    if (names.length >= MAX_PLAYERS) return;
    setNames((current) => [...current, ""]);
  }

  function removePlayer(index: number) {
    if (names.length <= MIN_PLAYERS) return;
    setNames((current) => current.filter((_, i) => i !== index));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedNames = names.map((name) => name.trim());

    if (trimmedNames.some((name) => name.length === 0)) {
      setError("Chaque joueur doit avoir un nom.");
      return;
    }

    try {
      const game = createGame({ playerNames: trimmedNames });
      saveCurrentGame(game);
      router.push("/purple/partie");
    } catch {
      setError("Impossible de préparer la partie sur cet appareil.");
    }
  }

  return (
    <form className="player-form" onSubmit={submit} noValidate>
      <div className="player-list">
        {names.map((name, index) => (
          <label className="player-row" key={index}>
            <span className="player-index" aria-hidden="true">
              {index + 1}
            </span>
            <input
              value={name}
              onChange={(event) => updateName(index, event.target.value)}
              placeholder="Son prénom"
              maxLength={24}
              autoComplete="off"
              aria-label={`Nom du joueur ${index + 1}`}
            />
            {names.length > MIN_PLAYERS ? (
              <button
                type="button"
                className="player-remove"
                onClick={() => removePlayer(index)}
                aria-label={`Retirer le joueur ${index + 1}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
          </label>
        ))}
        <button
          type="button"
          className="player-add"
          onClick={addPlayer}
          disabled={names.length >= MAX_PLAYERS}
        >
          + Ajouter un joueur
        </button>
      </div>

      <div>
        <p className="setup-note">{names.length} joueurs · le premier à jouer est tiré au sort</p>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit">
          Commencer la partie <span aria-hidden="true">→</span>
        </Button>
      </div>
    </form>
  );
}
