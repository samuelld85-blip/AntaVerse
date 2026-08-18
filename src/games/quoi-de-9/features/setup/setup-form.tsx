"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button, compactInputClassName, Field } from "@/games/quoi-de-9/components/ui";
import { GAME_CONFIG } from "@/games/quoi-de-9/lib/game/config";
import { createGame } from "@/games/quoi-de-9/lib/game/engine";
import { saveCurrentGame } from "@/games/quoi-de-9/lib/game/persistence";
import { createGameSchema, type CreateGameForm } from "@/games/quoi-de-9/lib/game/schemas";

export function SetupForm() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
      teamAColor: "#E83DFF",
      teamBColor: "#16C7E8",
      startingTeamIndex: 0,
      roundsPerTeam: GAME_CONFIG.defaultRoundsPerTeam,
      turnDurationSeconds: GAME_CONFIG.defaultTurnDurationSeconds,
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
          {(["A", "B"] as const).map((letter) => {
            const isA = letter === "A";
            const nameField = isA ? "teamAName" : "teamBName";
            const colorField = isA ? "teamAColor" : "teamBColor";
            const selectedColor = isA ? values.teamAColor : values.teamBColor;
            return (
              <section
                key={letter}
                className="relative overflow-hidden rounded-[1.5rem] border border-white/12 px-4 py-4 shadow-[0_16px_40px_rgba(0,0,0,.2)]"
                style={{
                  background: `linear-gradient(115deg, ${selectedColor}20, rgba(255,255,255,.045) 48%)`,
                }}
              >
                <div
                  className="absolute inset-y-0 left-0 w-1.5"
                  style={{ backgroundColor: selectedColor }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-4 pl-1">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black text-[var(--accent-ink)] shadow-lg"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {letter}
                  </span>
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor={`team-${letter}-name`}
                      className="block text-[9px] font-bold uppercase tracking-[0.16em] text-white/55"
                    >
                      Équipe {letter}
                    </label>
                    <input
                      {...register(nameField)}
                      id={`team-${letter}-name`}
                      aria-invalid={Boolean(errors[nameField])}
                      className="mt-1 h-9 w-full border-0 bg-transparent p-0 text-xl font-semibold text-white outline-none placeholder:text-white/40"
                      maxLength={24}
                      autoComplete="off"
                    />
                  </div>
                </div>
                {errors[nameField]?.message ? (
                  <p role="alert" className="mt-1 pl-14 text-[10px] font-bold text-[var(--coral)]">
                    {errors[nameField]?.message}
                  </p>
                ) : null}
                <input type="hidden" {...register(colorField)} />
              </section>
            );
          })}
        </div>

        <fieldset className="rounded-2xl border border-white/10 bg-white/[.035] p-3">
          <legend className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Qui commence ?</legend>
          <Controller
            control={control}
            name="startingTeamIndex"
            render={({ field }) => (
              <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                {([0, 1] as const).map((index) => (
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
                    {index === 0 ? values.teamAName : values.teamBName}
                  </label>
                ))}
              </div>
            )}
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
          <Button type="submit" disabled={!isReady || isSubmitting} className="min-h-12 rounded-2xl">
            {isSubmitting ? "Préparation…" : "Lancer la partie"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
