"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, compactInputClassName, Field } from "@/games/quoi-de-9/components/ui";
import { GAME_CONFIG } from "@/games/quoi-de-9/lib/game/config";
import { createGame } from "@/games/quoi-de-9/lib/game/engine";
import { saveCurrentGame } from "@/games/quoi-de-9/lib/game/persistence";
import { createGameSchema } from "@/games/quoi-de-9/lib/game/schemas";
import type { GameMode } from "@/games/quoi-de-9/lib/game/types";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";

export function SetupForm({ mode }: { mode: GameMode }) {
  const router = useRouter();
  const [teamAName, setTeamAName] = useState("Les Antagonistes");
  const [teamBName, setTeamBName] = useState("Les Sanglieeers");
  const [teamCName, setTeamCName] = useState("");
  const [hasThirdTeam, setHasThirdTeam] = useState(false);
  const [startingTeamIndex, setStartingTeamIndex] = useState(0);
  const [roundsPerTeam, setRoundsPerTeam] = useState<number>(GAME_CONFIG.defaultRoundsPerTeam);
  const [turnDurationSeconds, setTurnDurationSeconds] = useState<number>(
    GAME_CONFIG.defaultTurnDurationSeconds,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function removeThirdTeam() {
    setHasThirdTeam(false);
    setTeamCName("");
    // The third team could have been the one starting — fall back to team A.
    if (startingTeamIndex === 2) setStartingTeamIndex(0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    // The optional third team must be entirely absent from the payload when
    // it is not on screen: sending an empty teamCName (or a color without a
    // name) fails validation on a field the form doesn't render, which would
    // make the submit silently do nothing.
    const parsed = createGameSchema.safeParse({
      teamAName,
      teamBName,
      teamAColor: TEAM_PALETTE[0],
      teamBColor: TEAM_PALETTE[1],
      ...(hasThirdTeam
        ? { teamCName, teamCColor: TEAM_PALETTE[2] }
        : {}),
      startingTeamIndex,
      roundsPerTeam,
      turnDurationSeconds,
      mode,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vérifiez les informations saisies.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await saveCurrentGame(createGame(parsed.data));
      router.push("/quoi-de-9/partie");
    } catch (err) {
      console.error("Impossible d’enregistrer la partie", err);
      setError("Impossible d’enregistrer la partie sur cet appareil.");
      setIsSubmitting(false);
    }
  }

  const teamNames = [teamAName, teamBName];
  if (hasThirdTeam) teamNames.push(teamCName || "Équipe 3");

  return (
    <form
      className="grid min-h-0 gap-3.5 pb-2"
      onSubmit={submit}
      noValidate
      aria-busy={isSubmitting}
    >
      <fieldset className="contents" disabled={isSubmitting}>
        <div className="grid gap-3.5">
          <ParticipantCard
            badge="A"
            color={TEAM_PALETTE[0]}
            label="Équipe A"
            inputProps={{
              id: "team-A-name",
              value: teamAName,
              onChange: (event) => setTeamAName(event.target.value),
              "aria-label": "Équipe A",
            }}
          />
          <ParticipantCard
            badge="B"
            color={TEAM_PALETTE[1]}
            label="Équipe B"
            inputProps={{
              id: "team-B-name",
              value: teamBName,
              onChange: (event) => setTeamBName(event.target.value),
              "aria-label": "Équipe B",
            }}
          />

          {hasThirdTeam && (
            <ParticipantCard
              badge="C"
              color={TEAM_PALETTE[2]}
              label="Équipe C"
              onRemove={removeThirdTeam}
              removeLabel="Supprimer l’équipe 3"
              inputProps={{
                id: "team-C-name",
                value: teamCName,
                onChange: (event) => setTeamCName(event.target.value),
                "aria-label": "Équipe C",
              }}
            />
          )}
        </div>

        {!hasThirdTeam && (
          <AddParticipantButton onClick={() => setHasThirdTeam(true)} color={TEAM_PALETTE[2]}>
            Ajouter une équipe
          </AddParticipantButton>
        )}

        <fieldset className="rounded-2xl border border-white/10 bg-white/[.035] p-3">
          <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
            Qui commence ?
          </legend>
          <div
            className={`mt-1.5 grid gap-2.5 ${hasThirdTeam ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {teamNames.map((name, index) => (
              <label
                key={index}
                className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold transition ${
                  startingTeamIndex === index
                    ? "border-[var(--accent-text)] bg-[var(--accent-text)] text-[var(--accent-ink)]"
                    : "border-white/10 bg-white/[.04] text-white/60"
                }`}
              >
                <input
                  name="startingTeamIndex"
                  type="radio"
                  value={index}
                  checked={startingTeamIndex === index}
                  onChange={() => setStartingTeamIndex(index)}
                  className="sr-only"
                />
                {name}
              </label>
            ))}
          </div>
        </fieldset>

        <details className="rounded-2xl border border-white/8 bg-white/[.02] px-4 py-3.5">
          <summary className="cursor-pointer text-[11px] font-semibold text-white/60">
            Durée et nombre de manches
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Manches" className="gap-1 text-xs">
              <input
                type="number"
                min={GAME_CONFIG.minRoundsPerTeam}
                max={GAME_CONFIG.maxRoundsPerTeam}
                value={roundsPerTeam}
                onChange={(event) => setRoundsPerTeam(Number(event.target.value))}
                className={compactInputClassName}
              />
            </Field>
            <Field label="Secondes" className="gap-1 text-xs">
              <input
                type="number"
                min={GAME_CONFIG.minTurnDurationSeconds}
                max={GAME_CONFIG.maxTurnDurationSeconds}
                step={15}
                value={turnDurationSeconds}
                onChange={(event) => setTurnDurationSeconds(Number(event.target.value))}
                className={compactInputClassName}
              />
            </Field>
          </div>
        </details>

        {error ? (
          <p role="alert" className="rounded-2xl bg-[var(--coral)]/10 p-3 text-sm text-[var(--coral)]">
            {error}
          </p>
        ) : null}
        <div className="-mx-1 bg-[linear-gradient(to_top,var(--page)_70%,transparent)] px-1 pt-1">
          <Button type="submit" disabled={isSubmitting} className="min-h-12 rounded-2xl">
            {isSubmitting ? "Préparation…" : "Lancer la partie"}{" "}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
