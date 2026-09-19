"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button } from "@/games/shared/components/ui";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { usePlayerFields } from "@/games/shared/lib/use-player-fields";
import { questions } from "@/games/qui-de-nous-deux/data/questions";
import { createGame, ROUND_COUNT, TIMER_SECONDS } from "@/games/qui-de-nous-deux/lib/game/engine";
import { saveCurrentGame } from "@/games/qui-de-nous-deux/lib/game/persistence";

export function SetupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { fields, updateName } = usePlayerFields({ minPlayers: 2, maxPlayers: 2, defaultCount: 2 });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      saveCurrentGame(createGame({ duoTeam: fields[0]!.value, questionTeam: fields[1]!.value }, questions));
      router.push("/qui-de-nous-deux/partie" as Route);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Impossible de préparer la partie.");
    }
  }

  return (
    <form className="team-form qndd-setup-form" onSubmit={submit} noValidate>
      <div className="one-shot-player-fields qndd-player-fields">
        {fields.map((field, index) => (
          <ParticipantCard
            key={field.id}
            badge={index === 0 ? "D" : "Q"}
            color={index === 0 ? "var(--qndd-violet)" : "var(--qndd-lilac)"}
            label={index === 0 ? "Équipe dos à dos" : "Équipe poseuse de questions"}
            inputProps={{
              id: "qndd-player-" + (index + 1),
              value: field.value,
              onChange: (event) => updateName(field.id, event.target.value),
              placeholder: index === 0 ? "Dos à dos" : "Poseurs",
              autoComplete: "off",
            }}
          />
        ))}
      </div>
      <p className="setup-note">{ROUND_COUNT} questions · {TIMER_SECONDS} secondes par question · noms facultatifs.</p>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <Button type="submit">Lancer la partie <span aria-hidden="true">→</span></Button>
    </form>
  );
}
