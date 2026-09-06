"use client";
import { useState } from "react";
import {
  equipmentLabels,
  exercises,
  sessionLabels,
  type Equipment,
  type SessionKind,
} from "./catalog";
import {
  completeSet,
  createEntry,
  defaultConfig,
  type Session,
  storeSchema,
  emptyStore,
} from "./model";
import styles from "./sport.module.css";

function localDateTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function HistoryEditor({
  session,
  onSave,
  onCancel,
}: {
  session: Session;
  onSave: (session: Session) => void;
  onCancel: () => void;
}) {
  const [entries, setEntries] = useState(session.exercises);
  const [error, setError] = useState("");
  const [addId, setAddId] = useState(exercises[0]!.id);
  return (
    <section className={styles.panel}>
      <h2>Modifier la séance</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!entries.length) {
            setError("Conservez au moins un exercice, ou supprimez la séance depuis son détail.");
            return;
          }
          const form = new FormData(event.currentTarget);
          const startedAt = new Date(String(form.get("date"))).toISOString();
          const shift = new Date(startedAt).getTime() - new Date(session.startedAt).getTime();
          const shifted = (date: string) =>
            new Date(new Date(date).getTime() + shift).toISOString();
          const updated: Session = {
            ...session,
            name: String(form.get("name")).trim(),
            kind: String(form.get("kind")) as SessionKind,
            startedAt,
            endedAt: shifted(session.endedAt ?? session.startedAt),
            exercises: entries.map((entry) => {
              const completedSets = entry.completedSets.map((set, i) => ({
                ...set,
                completedAt: shifted(set.completedAt),
                equipment: String(form.get(`${entry.id}-${i}-equipment`)) as Equipment,
                loadKg: Number(form.get(`${entry.id}-${i}-load`)),
                reps: form.get(`${entry.id}-${i}-reps`)
                  ? Number(form.get(`${entry.id}-${i}-reps`))
                  : null,
              }));
              const last = completedSets.at(-1)!;
              return {
                ...entry,
                completedSets,
                finished: true,
                config: {
                  ...entry.config,
                  equipment: last.equipment,
                  loadKg: last.loadKg,
                  reps: last.reps,
                  sets: completedSets.length,
                  restSeconds:
                    Number(form.get(`${entry.id}-minutes`)) * 60 +
                    Number(form.get(`${entry.id}-seconds`)),
                },
              };
            }),
          };
          if (!storeSchema.safeParse({ ...emptyStore(), history: [updated] }).success) {
            setError(
              "Vérifiez les valeurs : repos de 0:05 à 30:00, charge positive et au moins une série par exercice.",
            );
            return;
          }
          onSave(updated);
        }}
      >
        <label className={styles.field}>
          Titre
          <input
            name="name"
            maxLength={100}
            defaultValue={session.name ?? sessionLabels[session.kind]}
          />
        </label>
        <div className={styles.fields}>
          <label className={styles.field}>
            Date et heure
            <input
              name="date"
              type="datetime-local"
              defaultValue={localDateTime(session.startedAt)}
              required
            />
          </label>
          <label className={styles.field}>
            Format
            <select name="kind" defaultValue={session.kind}>
              {Object.entries(sessionLabels)
                .filter(([id]) => ["full", "half", "ppl", session.kind].includes(id))
                .map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {entries.map((entry) => (
          <fieldset key={entry.id} className={styles.editExercise}>
            <legend>{exercises.find((ex) => ex.id === entry.config.exerciseId)!.name}</legend>
            <div className={styles.restInputs}>
              <label>
                Minutes de repos
                <input
                  aria-label={`Minutes de repos ${entry.id}`}
                  name={`${entry.id}-minutes`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={30}
                  defaultValue={Math.floor(entry.config.restSeconds / 60)}
                  required
                />
              </label>
              <label>
                Secondes de repos
                <input
                  aria-label={`Secondes de repos ${entry.id}`}
                  name={`${entry.id}-seconds`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  defaultValue={String(entry.config.restSeconds % 60).padStart(2, "0")}
                  required
                />
              </label>
            </div>
            {entry.completedSets.map((set, i) => (
              <div className={styles.editSet} key={i}>
                <span>Série {i + 1}</span>
                <label className={styles.field}>
                  Matériel
                  <select
                    aria-label={`Matériel série ${i + 1} ${entry.id}`}
                    name={`${entry.id}-${i}-equipment`}
                    defaultValue={set.equipment}
                  >
                    {exercises
                      .find((ex) => ex.id === entry.config.exerciseId)!
                      .equipment.map((e) => (
                        <option key={e} value={e}>
                          {equipmentLabels[e]}
                        </option>
                      ))}
                  </select>
                </label>
                <label className={styles.field}>
                  Charge (kg)
                  <input
                    aria-label={`Charge série ${i + 1} ${entry.id}`}
                    name={`${entry.id}-${i}-load`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={2000}
                    step={0.25}
                    defaultValue={set.loadKg}
                    required
                  />
                </label>
                <label className={styles.field}>
                  Rép. (facultatif)
                  <input
                    aria-label={`Répétitions série ${i + 1} ${entry.id}`}
                    name={`${entry.id}-${i}-reps`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={200}
                    defaultValue={set.reps ?? ""}
                  />
                </label>
              </div>
            ))}
            <p className={styles.hint}>
              Haltères : kg par haltère. Poids du corps : kg de lest ajouté.
            </p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.textButton}
                disabled={entry.completedSets.length >= 30}
                onClick={() =>
                  setEntries((items) =>
                    items.map((item) =>
                      item.id === entry.id
                        ? {
                            ...item,
                            completedSets: [
                              ...item.completedSets,
                              { ...item.completedSets.at(-1)! },
                            ],
                          }
                        : item,
                    ),
                  )
                }
              >
                Ajouter une série
              </button>
              {entry.completedSets.length > 1 && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() =>
                    setEntries((items) =>
                      items.map((item) =>
                        item.id === entry.id
                          ? { ...item, completedSets: item.completedSets.slice(0, -1) }
                          : item,
                      ),
                    )
                  }
                >
                  Retirer la dernière série
                </button>
              )}
              <button
                type="button"
                className={styles.textButton}
                onClick={() => setEntries((items) => items.filter((item) => item.id !== entry.id))}
              >
                Retirer l’exercice
              </button>
            </div>
          </fieldset>
        ))}
        <label className={styles.field}>
          Ajouter un exercice effectué
          <select value={addId} onChange={(e) => setAddId(e.target.value)}>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={styles.textButton}
          onClick={() => {
            const entry = completeSet(
              createEntry({ ...defaultConfig(addId), sets: 1 }),
              session.startedAt,
            );
            setEntries((items) => [...items, entry]);
          }}
        >
          Ajouter cet exercice
        </button>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.actions}>
          <button className={styles.primary} type="submit">
            Enregistrer les modifications
          </button>
          <button className={styles.secondary} type="button" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </form>
    </section>
  );
}
