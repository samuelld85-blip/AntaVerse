"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/la-relance/components/ui";
import { themes } from "@/games/la-relance/data/themes";
import { createGame } from "@/games/la-relance/lib/game/engine";
import { saveCurrentGame } from "@/games/la-relance/lib/game/persistence";

export function SetupForm() {
  const router = useRouter();
  const [teamOneName, setTeamOneName] = useState("Équipe 1");
  const [teamTwoName, setTeamTwoName] = useState("Équipe 2");
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
        { teamOneName: first || "Équipe 1", teamTwoName: second || "Équipe 2" },
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
        <label className="team-field team-field--one">
          <span className="team-number" aria-hidden="true">
            1
          </span>
          <span className="team-input-wrap">
            <span className="team-label">Nom de l’équipe 1</span>
            <input
              value={teamOneName}
              onChange={(event) => setTeamOneName(event.target.value)}
              maxLength={24}
              autoComplete="off"
              aria-label="Équipe 1"
            />
          </span>
        </label>

        <label className="team-field team-field--two">
          <span className="team-number" aria-hidden="true">
            2
          </span>
          <span className="team-input-wrap">
            <span className="team-label">Nom de l’équipe 2</span>
            <input
              value={teamTwoName}
              onChange={(event) => setTeamTwoName(event.target.value)}
              maxLength={24}
              autoComplete="off"
              aria-label="Équipe 2"
            />
          </span>
        </label>
      </div>

      <p className="setup-note">
        5 manches · 1 point par manche
      </p>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit">
        Commencer la partie <span aria-hidden="true">→</span>
      </Button>
    </form>
  );
}
