"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";
import { themes } from "@/games/la-relance/data/themes";
import { createGame } from "@/games/la-relance/lib/game/engine";
import { saveCurrentGame } from "@/games/la-relance/lib/game/persistence";

export function SetupForm() {
  const router = useRouter();
  const [teamOneName, setTeamOneName] = useState("Les Antagonistes");
  const [teamTwoName, setTeamTwoName] = useState("Les Sanglieeers");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const first = teamOneName.trim();
    const second = teamTwoName.trim();

    if (first && second && first.localeCompare(second, "fr", { sensitivity: "base" }) === 0) {
      setError("Choisissez deux noms différents.");
      return;
    }

    try {
      const game = createGame(
        { teamOneName: first || "Les Antagonistes", teamTwoName: second || "Les Sanglieeers" },
        themes,
      );
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
      </div>

      <p className="setup-note">5 manches · 1 point par manche</p>
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
