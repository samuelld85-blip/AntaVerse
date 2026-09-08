"use client";
import { useState, type ChangeEvent } from "react";
import {
  equipmentLabels,
  exercises,
  sessionLabels,
  type Equipment,
  type SessionKind,
} from "./catalog";
import {
  completeSet,
  setExerciseId,
  createEntry,
  defaultConfig,
  type ExerciseFeedback,
  type Session,
  storeSchema,
  emptyStore,
} from "./model";
import { compressPhoto, MAX_SESSION_PHOTOS } from "./photo-utils";
import styles from "./sport.module.css";

const feedbackOptions: ReadonlyArray<{
  mood: ExerciseFeedback["mood"];
  emoji: string;
  label: string;
}> = [
  { mood: "good", emoji: "🙂", label: "Content" },
  { mood: "okay", emoji: "😐", label: "Moyen" },
  { mood: "bad", emoji: "🙁", label: "Pas content" },
];

const feedbackColorClass = (mood: ExerciseFeedback["mood"]) =>
  mood === "good"
    ? styles.feedbackGood
    : mood === "okay"
      ? styles.feedbackOkay
      : styles.feedbackBad;

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
  const [sessionMood, setSessionMood] = useState<ExerciseFeedback["mood"] | "">(
    session.feedback?.mood ?? "",
  );
  const [sessionComment, setSessionComment] = useState(session.feedback?.comment ?? "");
  const [sessionPhotos, setSessionPhotos] = useState<string[]>(session.feedback?.photos ?? []);
  const [photoError, setPhotoError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [entryMoods, setEntryMoods] = useState<Record<string, ExerciseFeedback["mood"] | "">>(() =>
    Object.fromEntries(session.exercises.map((entry) => [entry.id, entry.feedback?.mood ?? ""])),
  );
  const [entryComments, setEntryComments] = useState<Record<string, string>>(() =>
    Object.fromEntries(session.exercises.map((entry) => [entry.id, entry.feedback?.comment ?? ""])),
  );

  async function handleSessionPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    const available = MAX_SESSION_PHOTOS - sessionPhotos.length;
    if (available <= 0) {
      setPhotoError(`Vous pouvez ajouter au maximum ${MAX_SESSION_PHOTOS} photos.`);
      return;
    }
    const selected = files.slice(0, available);
    setPhotoError(
      files.length > available
        ? `Seules ${MAX_SESSION_PHOTOS} photos peuvent être ajoutées à une séance.`
        : "",
    );
    setPhotoBusy(true);
    try {
      const compressed = await Promise.all(selected.map(compressPhoto));
      setSessionPhotos((current) => [...current, ...compressed].slice(0, MAX_SESSION_PHOTOS));
    } catch {
      setPhotoError("Impossible de charger une photo. Essayez une autre image.");
    } finally {
      setPhotoBusy(false);
    }
  }
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
          setError("");
          const trimmedSessionComment = sessionComment.trim();
          if (!sessionMood && (trimmedSessionComment || sessionPhotos.length)) {
            setError(
              "Sélectionnez un ressenti pour enregistrer le commentaire ou les photos de la séance.",
            );
            return;
          }
          const exerciseFeedback = entries.map((entry) => {
            const mood = entryMoods[entry.id] ?? entry.feedback?.mood ?? "";
            const comment = (entryComments[entry.id] ?? entry.feedback?.comment ?? "").trim();
            return {
              entry,
              feedback: mood ? { mood, comment } : undefined,
              hasCommentWithoutMood: !mood && Boolean(comment),
            };
          });
          if (exerciseFeedback.some((item) => item.hasCommentWithoutMood)) {
            setError("Sélectionnez un ressenti pour chaque commentaire d’exercice.");
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
            feedback: sessionMood
              ? {
                  mood: sessionMood,
                  comment: trimmedSessionComment,
                  ...(sessionPhotos.length ? { photos: sessionPhotos } : {}),
                }
              : undefined,
            exercises: exerciseFeedback.map(({ entry, feedback }) => {
              const completedSets = entry.completedSets.map((set, i) => ({
                ...set,
                completedAt: shifted(set.completedAt),
                equipment: String(form.get(`${entry.id}-${i}-equipment`)) as Equipment,
                loadKg: Number(form.get(`${entry.id}-${i}-load`)),
                reps: form.get(`${entry.id}-${i}-reps`)
                  ? Number(form.get(`${entry.id}-${i}-reps`))
                  : null,
              }));
              const lastFor = (config: typeof entry.config) =>
                [...completedSets]
                  .reverse()
                  .find((set) => setExerciseId(entry, set) === config.exerciseId) ??
                completedSets.at(-1)!;
              const configWithLastSet = (config: typeof entry.config) => {
                const last = lastFor(config);
                return {
                  ...config,
                  equipment: last.equipment,
                  loadKg: last.loadKg,
                  reps: last.reps,
                };
              };
              const rounds = entry.superset
                ? Math.floor(completedSets.length / 2)
                : completedSets.length;
              const restSeconds =
                Number(form.get(`${entry.id}-minutes`)) * 60 +
                Number(form.get(`${entry.id}-seconds`));
              return {
                ...entry,
                feedback,
                completedSets,
                completedRounds: rounds,
                finished: true,
                config: {
                  ...configWithLastSet(entry.config),
                  sets: rounds,
                  restSeconds,
                },
                ...(entry.superset
                  ? {
                      superset: {
                        ...configWithLastSet(entry.superset),
                        sets: rounds,
                        restSeconds,
                      },
                    }
                  : {}),
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
                .filter(([id]) =>
                  session.kind === "half" || session.kind === "ppl"
                    ? ["full", "upper", "lower", "push", "pull", "legs", session.kind].includes(
                        id,
                      )
                    : ["full", "upper", "lower", "push", "pull", "legs"].includes(id),
                )
                .map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <fieldset className={styles.editFeedback}>
          <legend>Ressenti de la séance</legend>
          <div className={styles.feedbackOptions}>
            {feedbackOptions.map((option) => (
              <button
                key={option.mood}
                type="button"
                className={`${styles.feedbackOption} ${feedbackColorClass(option.mood)}`}
                aria-pressed={sessionMood === option.mood}
                onClick={() =>
                  setSessionMood((current) => (current === option.mood ? "" : option.mood))
                }
              >
                <span className={styles.feedbackEmoji} aria-hidden="true">
                  {option.emoji}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <label className={`${styles.field} ${styles.feedbackComment}`}>
            <span>
              Commentaire <span className={styles.feedbackOptional}>(facultatif)</span>
            </span>
            <textarea
              value={sessionComment}
              onChange={(event) => setSessionComment(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Une remarque sur la séance ?"
            />
          </label>
          <div className={styles.photoSection}>
            <span className={styles.photoLabel}>
              Photos <span className={styles.feedbackOptional}>(facultatif)</span>
            </span>
            <label className={styles.photoPicker}>
              <input
                className={styles.visuallyHidden}
                type="file"
                accept="image/*"
                multiple
                disabled={photoBusy || sessionPhotos.length >= MAX_SESSION_PHOTOS}
                onChange={(event) => void handleSessionPhotos(event)}
              />
              <span aria-hidden="true">＋</span>
              {photoBusy ? "Chargement…" : "Ajouter une ou des photos"}
            </label>
            <span className={styles.photoCount}>
              {sessionPhotos.length}/{MAX_SESSION_PHOTOS} photo{sessionPhotos.length > 1 ? "s" : ""}
            </span>
            {photoError && (
              <span className={styles.photoError} role="alert">
                {photoError}
              </span>
            )}
            {sessionPhotos.length > 0 && (
              <div className={styles.photoPreviewList}>
                {sessionPhotos.map((photo, index) => (
                  <div className={styles.photoPreview} key={photo}>
                    <img src={photo} alt={`Photo ${index + 1} ajoutée`} />
                    <button
                      type="button"
                      className={styles.photoRemove}
                      onClick={() =>
                        setSessionPhotos((current) => current.filter((_, i) => i !== index))
                      }
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </fieldset>
        {entries.map((entry) => {
          const entryConfigs = [entry.config, ...(entry.superset ? [entry.superset] : [])];
          return (
            <fieldset key={entry.id} className={styles.editExercise}>
              <legend>
                {entryConfigs
                  .map((config) => exercises.find((ex) => ex.id === config.exerciseId)!.name)
                  .join(" + ")}
                {entry.superset ? " · Superset" : ""}
                {entry.pyramid ? " · Pyramidal" : ""}
              </legend>
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
              {entry.completedSets.map((set, i) => {
                const setConfig =
                  entryConfigs.find((config) => config.exerciseId === setExerciseId(entry, set)) ??
                  entry.config;
                const setLabel = entry.superset
                  ? `${exercises.find((ex) => ex.id === setConfig.exerciseId)!.name} · tour ${Math.floor(i / 2) + 1}`
                  : `Série ${i + 1}`;
                return (
                  <div className={styles.editSet} key={i}>
                    <span>{setLabel}</span>
                    <label className={styles.field}>
                      Matériel
                      <select
                        aria-label={`Matériel série ${i + 1} ${entry.id}`}
                        name={`${entry.id}-${i}-equipment`}
                        defaultValue={set.equipment}
                      >
                        {exercises
                          .find((ex) => ex.id === setConfig.exerciseId)!
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
                );
              })}
              <p className={styles.hint}>
                Haltères : kg par haltère. Poids du corps : kg de lest ajouté.
              </p>
              <fieldset className={styles.editFeedback}>
                <legend>Ressenti de l’exercice</legend>
                <div className={styles.feedbackOptions}>
                  {feedbackOptions.map((option) => (
                    <button
                      key={option.mood}
                      type="button"
                      className={`${styles.feedbackOption} ${feedbackColorClass(option.mood)}`}
                      aria-pressed={
                        (entryMoods[entry.id] ?? entry.feedback?.mood ?? "") === option.mood
                      }
                      onClick={() =>
                        setEntryMoods((current) => ({
                          ...current,
                          [entry.id]: current[entry.id] === option.mood ? "" : option.mood,
                        }))
                      }
                    >
                      <span className={styles.feedbackEmoji} aria-hidden="true">
                        {option.emoji}
                      </span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
                <label className={`${styles.field} ${styles.feedbackComment}`}>
                  <span>
                    Commentaire <span className={styles.feedbackOptional}>(facultatif)</span>
                  </span>
                  <textarea
                    value={entryComments[entry.id] ?? entry.feedback?.comment ?? ""}
                    onChange={(event) =>
                      setEntryComments((current) => ({
                        ...current,
                        [entry.id]: event.target.value,
                      }))
                    }
                    maxLength={1000}
                    rows={3}
                    placeholder="Une remarque sur l’exercice ?"
                  />
                </label>
              </fieldset>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.textButton}
                  disabled={
                    entry.completedSets.length >= entry.config.sets * (entry.superset ? 2 : 1)
                  }
                  onClick={() =>
                    setEntries((items) =>
                      items.map((item) =>
                        item.id === entry.id
                          ? {
                              ...item,
                              completedSets: item.superset
                                ? [
                                    ...item.completedSets,
                                    ...[item.config, item.superset].map((config) => ({
                                      ...([...item.completedSets]
                                        .reverse()
                                        .find(
                                          (set) => setExerciseId(item, set) === config.exerciseId,
                                        ) ?? item.completedSets.at(-1)!),
                                      exerciseId: config.exerciseId,
                                    })),
                                  ]
                                : [...item.completedSets, { ...item.completedSets.at(-1)! }],
                              completedRounds: item.superset
                                ? item.completedRounds + 1
                                : item.completedSets.length + 1,
                            }
                          : item,
                      ),
                    )
                  }
                >
                  Ajouter une série
                </button>
                {entry.completedSets.length > (entry.superset ? 2 : 1) && (
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() =>
                      setEntries((items) =>
                        items.map((item) =>
                          item.id === entry.id
                            ? {
                                ...item,
                                completedSets: item.completedSets.slice(0, item.superset ? -2 : -1),
                                completedRounds: item.superset
                                  ? Math.max(0, item.completedRounds - 1)
                                  : item.completedSets.length - 1,
                              }
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
                  onClick={() =>
                    setEntries((items) => items.filter((item) => item.id !== entry.id))
                  }
                >
                  Retirer l’exercice
                </button>
              </div>
            </fieldset>
          );
        })}
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
