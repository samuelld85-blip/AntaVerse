"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/sans-le-dire/components/ui";
import { cards } from "@/games/sans-le-dire/data/cards";
import { createGame } from "@/games/sans-le-dire/lib/game/engine";
import { loadTeamNames, saveCurrentGame, saveTeamNames } from "@/games/sans-le-dire/lib/game/persistence";

export function SetupForm() {
  const router = useRouter();
  const [teamOneName, setTeamOneName] = useState("Les Antagonistes");
  const [teamTwoName, setTeamTwoName] = useState("Les Sanglieeers");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => { const [one, two] = loadTeamNames(); setTeamOneName(one); setTeamTwoName(two); }, 0); return () => window.clearTimeout(timer); }, []);

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
        cards,
      );
      saveCurrentGame(game);
      saveTeamNames([game.teams[0].name, game.teams[1].name]);
      router.push("/sans-le-dire/partie");
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
        4 manches · 45 secondes · 2 passes
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
