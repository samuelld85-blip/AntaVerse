"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, compactInputClassName, Field } from "@/games/quoi-de-9/components/ui";
import { GAME_CONFIG } from "@/games/quoi-de-9/lib/game/config";
import { createGame } from "@/games/quoi-de-9/lib/game/engine";
import { saveCurrentGame } from "@/games/quoi-de-9/lib/game/persistence";
import { createGameSchema, type CreateGameForm } from "@/games/quoi-de-9/lib/game/schemas";
import type { GameMode } from "@/games/quoi-de-9/lib/game/types";
import { AddParticipantButton } from "@/games/shared/components/add-participant-button";
import { ParticipantCard } from "@/games/shared/components/participant-card";
import { TEAM_PALETTE } from "@/games/shared/lib/team-palette";

const DEFAULT_COLORS = TEAM_PALETTE;

export function SetupForm({ mode }: { mode: GameMode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasThirdTeam, setHasThirdTeam] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateGameForm>({
    defaultValues: {
      teamAName: "Les Antagonistes",
      teamBName: "Les Sanglieeers",
      teamAColor: DEFAULT_COLORS[0],
      teamBColor: DEFAULT_COLORS[1],
      teamCName: "",
      teamCColor: DEFAULT_COLORS[2],
      startingTeamIndex: 0,
      roundsPerTeam: GAME_CONFIG.defaultRoundsPerTeam,
      turnDurationSeconds: GAME_CONFIG.defaultTurnDurationSeconds,
      mode,
    },
  });

  const values = useWatch({ control });

  useEffect(() => {
    const readinessTimer = window.setTimeout(() => setIsReady(true), 0);
    return () => window.clearTimeout(readinessTimer);
  }, []);

  async function submit(rawInput: CreateGameForm) {
    setSubmitError(null);
    const parsed = createGameSchema.safeParse(rawInput);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof CreateGameForm, { message: issue.message });
        }
      }
      return;
    }
    try {
      await saveCurrentGame(createGame(parsed.data));
      router.push("/quoi-de-9/partie");
    } catch (error) {
      console.error("Impossible d’enregistrer la partie", error);
      setSubmitError("Impossible d’enregistrer la partie sur cet appareil.");
    }
  }

  return (
    <form
      className="grid min-h-0 gap-3.5 pb-2"
      onSubmit={handleSubmit(submit)}
      noValidate
      aria-busy={!isReady || isSubmitting}
    >
      <fieldset className="contents" disabled={isSubmitting}>
        <div className="grid gap-3.5">
          {(["A", "B"] as const).map((letter, index) => {
            const nameField = letter === "A" ? "teamAName" : "teamBName";
            const colorField = letter === "A" ? "teamAColor" : "teamBColor";
            const selectedColor = DEFAULT_COLORS[index]!;
            return (
              <div key={letter}>
                <ParticipantCard
                  badge={letter}
                  color={selectedColor}
                  label={`Équipe ${letter}`}
                  error={errors[nameField]?.message}
                  inputProps={{
                    ...register(nameField),
                    id: `team-${letter}-name`,
                    "aria-invalid": Boolean(errors[nameField]),
                  }}
                />
                <input type="hidden" {...register(colorField)} />
              </div>
            );
          })}

          {hasThirdTeam && (
            <div>
              <ParticipantCard
                badge="C"
                color={DEFAULT_COLORS[2]}
                label="Équipe C"
                error={errors.teamCName?.message}
                onRemove={() => setHasThirdTeam(false)}
                removeLabel="Supprimer équipe C"
                inputProps={{
                  ...register("teamCName"),
                  id: "team-c-name",
                  "aria-invalid": Boolean(errors.teamCName),
                }}
              />
              <input type="hidden" {...register("teamCColor")} />
            </div>
          )}
        </div>

        {!hasThirdTeam && (
          <AddParticipantButton onClick={() => setHasThirdTeam(true)} color={DEFAULT_COLORS[2]}>
            Ajouter équipe 3
          </AddParticipantButton>
        )}

        <fieldset className="rounded-2xl border border-white/10 bg-white/[.035] p-3">
          <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">
            Qui commence ?
          </legend>
          <Controller
            control={control}
            name="startingTeamIndex"
            render={({ field }) => {
              const teamCount = hasThirdTeam ? 3 : 2;
              const gridColsClass =
                teamCount === 2 ? "grid-cols-2" : "grid-cols-3";
              const teamNames = [values.teamAName, values.teamBName];
              if (hasThirdTeam) teamNames.push(values.teamCName || "Équipe 3");
              return (
                <div className={`mt-1.5 grid ${gridColsClass} gap-2.5`}>
                  {Array.from({ length: teamCount }).map((_, index) => (
                    <label
                      key={index}
                      className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-3 text-center text-sm font-semibold transition ${field.value === index ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--accent-ink)]" : "border-white/10 bg-white/[.04] text-white/60"}`}
                    >
                      <input
                        ref={field.ref}
                        name={field.name}
                        type="radio"
                        value={index}
                        checked={field.value === index}
                        onBlur={field.onBlur}
                        onChange={() => field.onChange(index)}
                        className="sr-only"
                      />
                      {teamNames[index]}
                    </label>
                  ))}
                </div>
              );
            }}
          />
        </fieldset>

        <details className="rounded-2xl border border-white/8 bg-white/[.02] px-4 py-3.5">
          <summary className="cursor-pointer text-[11px] font-semibold text-white/60">
            Durée et nombre de manches
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Field label="Manches" error={errors.roundsPerTeam?.message} className="gap-1 text-xs">
              <input
                {...register("roundsPerTeam", { valueAsNumber: true })}
                type="number"
                min={GAME_CONFIG.minRoundsPerTeam}
                max={GAME_CONFIG.maxRoundsPerTeam}
                className={compactInputClassName}
              />
            </Field>
            <Field
              label="Secondes"
              error={errors.turnDurationSeconds?.message}
              className="gap-1 text-xs"
            >
              <input
                {...register("turnDurationSeconds", { valueAsNumber: true })}
                type="number"
                min={GAME_CONFIG.minTurnDurationSeconds}
                max={GAME_CONFIG.maxTurnDurationSeconds}
                step={15}
                className={compactInputClassName}
              />
            </Field>
          </div>
        </details>

        {submitError ? (
          <p
            role="alert"
            className="rounded-2xl bg-[var(--coral)]/10 p-3 text-sm text-[var(--coral)]"
          >
            {submitError}
          </p>
        ) : null}
        <div className="-mx-1 bg-[linear-gradient(to_top,var(--page)_70%,transparent)] px-1 pt-1">
          <Button
            type="submit"
            disabled={!isReady || isSubmitting}
            className="min-h-12 rounded-2xl"
          >
            {isSubmitting ? "Préparation…" : "Lancer la partie"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
