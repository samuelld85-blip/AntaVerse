"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import { cards } from "@/games/sans-le-dire/data/cards";
import { createGame } from "@/games/sans-le-dire/lib/game/engine";
import {
  clearSoloGame,
  loadTeamNames,
  saveCurrentGame,
  saveTeamNames,
} from "@/games/sans-le-dire/lib/game/persistence";
import type { PlayMode } from "@/games/sans-le-dire/lib/game/types";

export function SetupForm({ playMode }: { playMode: PlayMode }) {
  const router = useRouter();
  const [teamOneName, setTeamOneName] = useState("Les Antagonistes");
  const [teamTwoName, setTeamTwoName] = useState("Les Sanglieeers");
  const [teamThreeName, setTeamThreeName] = useState("");
  const [hasThirdTeam, setHasThirdTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const names = loadTeamNames();
      setTeamOneName(names[0]);
      setTeamTwoName(names[1]);
      if (names.length === 3) {
        setTeamThreeName(names[2]);
        setHasThirdTeam(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const first = teamOneName.trim();
    const second = teamTwoName.trim();
    const third = teamThreeName.trim();

    if (!first || !second) {
      setError("Remplissez au moins deux équipes.");
      return;
    }

    const names = [first, second];
    if (hasThirdTeam && third) {
      names.push(third);
    }

    const uniqueNames = new Set(names.map((n) => n.toLowerCase()));
    if (uniqueNames.size !== names.length) {
      setError("Choisissez des noms différents.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const teamNames = (
        names.length === 3
          ? [names[0], names[1], names[2]] as [string, string, string]
          : [names[0], names[1]] as [string, string]
      );
      const game = createGame(
        { teamNames, playMode },
        cards,
      );
      clearSoloGame();
      saveCurrentGame(game);
      saveTeamNames(teamNames);
      router.push("/sans-le-dire/partie");
    } catch (err) {
      console.error("Erreur lors de la création de la partie:", err);
      setError("Impossible de préparer la partie sur cet appareil.");
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="team-form"
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      <fieldset disabled={isSubmitting} className="contents">
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
          4 manches · 45 secondes · 2 passes {hasThirdTeam ? "· 3 équipes" : ""}
        </p>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          Lancer la partie <span aria-hidden="true">→</span>
        </Button>
      </fieldset>
    </form>
  );
}
