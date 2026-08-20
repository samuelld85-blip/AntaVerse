"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import { themes } from "@/games/la-relance/data/themes";
import { createGame } from "@/games/la-relance/lib/game/engine";
import { saveCurrentGame } from "@/games/la-relance/lib/game/persistence";

export function SetupForm() {
  const router = useRouter();
  const [teamOneName, setTeamOneName] = useState("Les Antagonistes");
  const [teamTwoName, setTeamTwoName] = useState("Les Sanglieeers");
  const [teamThreeName, setTeamThreeName] = useState("");
  const [hasThirdTeam, setHasThirdTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const teamNames =
        names.length === 3
          ? ([names[0], names[1], names[2]] as [string, string, string])
          : ([names[0], names[1]] as [string, string]);
      const game = createGame({ teamNames }, themes);
      saveCurrentGame(game);
      router.push("/la-relance/partie");
    } catch {
      setError("Impossible de préparer la partie sur cet appareil.");
    }
  }

  return (
    <form className="team-form" onSubmit={submit} noValidate>
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
        5 manches · 1 point par manche {hasThirdTeam ? "· 3 équipes" : ""}
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
