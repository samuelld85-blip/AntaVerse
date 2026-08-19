"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/games/shared/components/ui";
import { cards } from "@/games/sans-le-dire/data/cards";
import { createGame } from "@/games/sans-le-dire/lib/game/engine";
import {
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

          {hasThirdTeam && (
            <label className="team-field team-field--three">
              <span className="team-number" aria-hidden="true">
                3
              </span>
              <span className="team-input-wrap">
                <span className="team-label">Nom de l’équipe 3</span>
                <input
                  value={teamThreeName}
                  onChange={(event) => setTeamThreeName(event.target.value)}
                  maxLength={24}
                  autoComplete="off"
                  aria-label="Équipe 3"
                />
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setHasThirdTeam(false);
                  setTeamThreeName("");
                }}
                className="team-remove-button"
                aria-label="Supprimer l’équipe 3"
                title="Supprimer cette équipe"
              >
                ×
              </button>
            </label>
          )}
        </div>

        {!hasThirdTeam && (
          <button
            type="button"
            onClick={() => setHasThirdTeam(true)}
            className="text-center text-sm text-tertiary transition hover:text-primary/80"
          >
            + Ajouter une équipe
          </button>
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
          Commencer la partie <span aria-hidden="true">→</span>
        </Button>
      </fieldset>
    </form>
  );
}
