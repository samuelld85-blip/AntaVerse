"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import { hasEmptyName } from "@/games/shared/lib/participant-list";
import { usePlayerFields } from "@/games/shared/lib/use-player-fields";
import { themes } from "@/games/la-relance/data/themes";
import {
  MAX_SOLO_PLAYERS,
  MIN_SOLO_PLAYERS,
  createGame,
} from "@/games/la-relance/lib/game/engine";
import { saveCurrentGame } from "@/games/la-relance/lib/game/persistence";
import type { ParticipantMode } from "@/games/la-relance/lib/game/types";

const SOLO_ACCENT = "var(--game-accent)";
const DEFAULT_SOLO_PLAYER_COUNT = 3;

export function SetupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<ParticipantMode>("teams");
  const [teamOneName, setTeamOneName] = useState("Les Antagonistes");
  const [teamTwoName, setTeamTwoName] = useState("Les Sanglieeers");
  const [teamThreeName, setTeamThreeName] = useState("");
  const [hasThirdTeam, setHasThirdTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fields, updateName, addPlayer, removePlayer, isRemovable, canAddMore } = usePlayerFields({
    minPlayers: MIN_SOLO_PLAYERS,
    maxPlayers: MAX_SOLO_PLAYERS,
    defaultCount: DEFAULT_SOLO_PLAYER_COUNT,
  });

  function selectMode(next: ParticipantMode) {
    setMode(next);
    setError(null);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "solo") {
      if (hasEmptyName(fields)) {
        setError("Chaque joueur doit avoir un nom.");
        return;
      }
      try {
        const game = createGame(
          { teamNames: fields.map((field) => field.value.trim()), mode },
          themes,
        );
        saveCurrentGame(game);
        router.push("/la-relance/partie");
      } catch {
        setError("Impossible de préparer la partie sur cet appareil.");
      }
      return;
    }

    const first = teamOneName.trim();
    const second = teamTwoName.trim();
    const third = teamThreeName.trim();

    const names = [first || "Les Antagonistes", second || "Les Sanglieeers"];
    if (hasThirdTeam && third) names.push(third);

    const uniqueNames = new Set(names.map((name) => name.toLowerCase()));
    if (uniqueNames.size !== names.length) {
      setError("Choisissez des noms différents.");
      return;
    }

    try {
      const game = createGame({ teamNames: names, mode }, themes);
      saveCurrentGame(game);
      router.push("/la-relance/partie");
    } catch {
      setError("Impossible de préparer la partie sur cet appareil.");
    }
  }

  return (
    <form className="team-form" onSubmit={submit} noValidate>
      <div className="mode-switch" role="radiogroup" aria-label="Mode de jeu">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "teams"}
          className={`mode-switch-option${mode === "teams" ? " mode-switch-option--active" : ""}`}
          onClick={() => selectMode("teams")}
        >
          Équipes
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "solo"}
          className={`mode-switch-option${mode === "solo" ? " mode-switch-option--active" : ""}`}
          onClick={() => selectMode("solo")}
        >
          Joueurs
        </button>
      </div>

      {mode === "teams" ? (
        <>
          <div className="team-fields">
            <ParticipantCard
              badge={1}
              color={TEAM_PALETTE[0]}
              label="Nom de l’équipe 1"
              inputProps={{
                value: teamOneName,
                onChange: (event) => setTeamOneName(event.target.value),
                "aria-label": "Équipe 1",
              }}
            />
            <ParticipantCard
              badge={2}
              color={TEAM_PALETTE[1]}
              label="Nom de l’équipe 2"
              inputProps={{
                value: teamTwoName,
                onChange: (event) => setTeamTwoName(event.target.value),
                "aria-label": "Équipe 2",
              }}
            />

            {hasThirdTeam && (
              <ParticipantCard
                badge={3}
                color={TEAM_PALETTE[2]}
                label="Nom de l’équipe 3"
                onRemove={() => {
                  setHasThirdTeam(false);
                  setTeamThreeName("");
                }}
                removeLabel="Supprimer l’équipe 3"
                inputProps={{
                  value: teamThreeName,
                  onChange: (event) => setTeamThreeName(event.target.value),
                  "aria-label": "Équipe 3",
                }}
              />
            )}
          </div>

          {!hasThirdTeam && (
            <AddParticipantButton onClick={() => setHasThirdTeam(true)} color={TEAM_PALETTE[2]}>
              Ajouter une équipe
            </AddParticipantButton>
          )}

          <p className="setup-note">
            7 manches · 1 point par manche {hasThirdTeam ? "· 3 équipes" : ""}
          </p>
        </>
      ) : (
        <>
          <div className="player-fields">
            {fields.map((field, index) => (
              <ParticipantCard
                key={field.id}
                badge={index + 1}
                color={SOLO_ACCENT}
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
          </div>

          {canAddMore ? (
            <AddParticipantButton onClick={addPlayer} color={SOLO_ACCENT}>
              Ajouter un joueur
            </AddParticipantButton>
          ) : null}

          <p className="setup-note">
            7 manches · 1 point par manche · {MIN_SOLO_PLAYERS} à {MAX_SOLO_PLAYERS} joueurs
          </p>
        </>
      )}

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
