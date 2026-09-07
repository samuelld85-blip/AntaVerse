"use client";

import Link from "next/link";
import { SessionReactions, SportSocial } from "./cloud/social";
import { useSportCloud } from "./cloud/provider";
import { getCloud, friendlyError } from "./cloud/client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SportIcon } from "@/components/sport-icon";
import { useThemeMode } from "@/lib/use-theme-mode";
import { ExerciseIcon } from "./exercise-icon";
import { HistoryEditor } from "./history-editor";
import { compressPhoto, MAX_SESSION_PHOTOS } from "./photo-utils";
import { StatsDashboard } from "./stats-dashboard";
import {
  configsForRecommendedWorkout,
  recommendedWorkoutsFor,
  workoutDurations,
  type WorkoutDuration,
} from "./recommended-workouts";
import {
  equipmentLabels,
  exercises,
  muscleLabels,
  searchExercises,
  sessionLabels,
  type Equipment,
  type SessionKind,
} from "./catalog";
import {
  completeSet,
  configKey,
  createEntry,
  createSession,
  defaultConfig,
  finishSession,
  loadStore,
  saveStore,
  storeSchema,
  timeLabel,
  type ExerciseConfig,
  type ExerciseEntry,
  type ExerciseFeedback,
  type Session,
  type SportStore,
} from "./model";
import { useRestTimer } from "./use-rest-timer";
import styles from "./sport.module.css";

type HistoryItem = {
  session: Session;
  ownerId: string;
  username: string;
  isFriend: boolean;
};

type HistoryFilter = "all" | "mine" | "friends";

const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(date),
  );
const exerciseName = (id: string) => exercises.find((ex) => ex.id === id)!.name;
const loadLabel = (c: ExerciseConfig) =>
  c.equipment === "bodyweight"
    ? c.loadKg
      ? `+${c.loadKg} kg de lest`
      : "Poids du corps"
    : `${c.loadKg} kg${c.equipment === "dumbbell" ? " / haltère" : ""}`;
const loadInputLabel = (equipment: Equipment) =>
  equipment === "bodyweight"
    ? "Lest (kg)"
    : equipment === "dumbbell"
      ? "Kg par haltère"
      : "Charge (kg)";
function ConfigSummary({ config }: { config: ExerciseConfig }) {
  return (
    <span>
      {equipmentLabels[config.equipment]} · {loadLabel(config)}
      <br />
      {config.sets} séries{config.reps ? ` × ${config.reps} rép.` : ""} · repos{" "}
      {timeLabel(config.restSeconds)}
    </span>
  );
}
function Star({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.star} ${selected ? styles.starred : ""}`}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
    >
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill={selected ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3 9.6l6.2-.9Z" />
      </svg>
    </button>
  );
}

const feedbackOptions: ReadonlyArray<{
  mood: ExerciseFeedback["mood"];
  emoji: string;
  label: string;
}> = [
  { mood: "good", emoji: "🙂", label: "Content" },
  { mood: "okay", emoji: "😐", label: "Moyen" },
  { mood: "bad", emoji: "🙁", label: "Pas content" },
];
const feedbackEmojiByMood: Record<ExerciseFeedback["mood"], string> = {
  good: "🙂",
  okay: "😐",
  bad: "🙁",
};
const feedbackColorClass = (mood: ExerciseFeedback["mood"]) =>
  mood === "good"
    ? styles.feedbackGood
    : mood === "okay"
      ? styles.feedbackOkay
      : styles.feedbackBad;

type FeedbackFormValue = ExerciseFeedback & { photos?: string[] };

function FeedbackForm({
  eyebrow,
  title,
  commentPlaceholder,
  allowPhotos = false,
  nextLabel,
  onSubmit,
}: {
  eyebrow: string;
  title: string;
  commentPlaceholder: string;
  allowPhotos?: boolean;
  nextLabel: string;
  onSubmit: (feedback: FeedbackFormValue) => void;
}) {
  const [mood, setMood] = useState<ExerciseFeedback["mood"] | null>(null);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  async function handlePhotoFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;
    const available = MAX_SESSION_PHOTOS - photos.length;
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
      setPhotos((current) => [...current, ...compressed].slice(0, MAX_SESSION_PHOTOS));
    } catch {
      setPhotoError("Impossible de charger une photo. Essayez une autre image.");
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <section className={`${styles.panel} ${styles.feedbackPanel}`} aria-labelledby="feedback-title">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 id="feedback-title">{title}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!mood) return;
          onSubmit({ mood, comment: comment.trim(), ...(allowPhotos ? { photos } : {}) });
        }}
      >
        <fieldset className={styles.feedbackChoices}>
          <legend className={styles.visuallyHidden}>Votre ressenti</legend>
          <div className={styles.feedbackOptions}>
            {feedbackOptions.map((option) => (
              <button
                key={option.mood}
                type="button"
                className={`${styles.feedbackOption} ${feedbackColorClass(option.mood)}`}
                aria-pressed={mood === option.mood}
                onClick={() => setMood(option.mood)}
              >
                <span className={styles.feedbackEmoji} aria-hidden="true">
                  {option.emoji}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <label className={`${styles.field} ${styles.feedbackComment}`}>
          <span>
            Commentaire <span className={styles.feedbackOptional}>(facultatif)</span>
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder={commentPlaceholder}
          />
        </label>
        {allowPhotos && (
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
                disabled={photoBusy || photos.length >= MAX_SESSION_PHOTOS}
                onChange={(event) => void handlePhotoFiles(event)}
              />
              <span aria-hidden="true">＋</span>
              {photoBusy ? "Chargement…" : "Ajouter une ou des photos"}
            </label>
            <span className={styles.photoCount}>
              {photos.length}/{MAX_SESSION_PHOTOS} photo{photos.length > 1 ? "s" : ""}
            </span>
            {photoError && (
              <span className={styles.photoError} role="alert">
                {photoError}
              </span>
            )}
            {photos.length > 0 && (
              <div className={styles.photoPreviewList}>
                {photos.map((photo, index) => (
                  <div className={styles.photoPreview} key={photo}>
                    <img src={photo} alt={`Photo ${index + 1} ajoutée`} />
                    <button
                      type="button"
                      className={styles.photoRemove}
                      onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button className={styles.primary} type="submit" disabled={!mood || photoBusy}>
          {nextLabel}
        </button>
      </form>
    </section>
  );
}

function ConfigForm({
  initial,
  minimumSets = 1,
  onSubmit,
  onCancel,
}: {
  initial: ExerciseConfig;
  minimumSets?: number;
  onSubmit: (config: ExerciseConfig) => void;
  onCancel: () => void;
}) {
  const [equipment, setEquipment] = useState(initial.equipment);
  const [formError, setFormError] = useState("");
  const exercise = exercises.find((ex) => ex.id === initial.exerciseId)!;
  return (
    <section className={styles.panel} aria-label="Configuration de l’exercice">
      <p className={styles.eyebrow}>{exercise.region}</p>
      <h2>{exercise.name}</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const restSeconds =
            Number(values.get("restMinutes")) * 60 + Number(values.get("restSeconds"));
          if (restSeconds < 5 || restSeconds > 1800) {
            setFormError("Choisissez un repos entre 0:05 et 30:00.");
            return;
          }
          onSubmit({
            exerciseId: initial.exerciseId,
            equipment,
            sets: Number(values.get("sets")),
            restSeconds,
            loadKg: Number(values.get("load")),
            reps: values.get("reps") ? Number(values.get("reps")) : null,
          });
        }}
      >
        <label className={styles.field}>
          Matériel
          <select value={equipment} onChange={(e) => setEquipment(e.target.value as Equipment)}>
            {exercise.equipment.map((item) => (
              <option key={item} value={item}>
                {equipmentLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.fields}>
          <label className={styles.field}>
            Séries
            <input
              autoFocus
              name="sets"
              type="number"
              inputMode="numeric"
              min={minimumSets}
              max={30}
              step={1}
              defaultValue={initial.sets}
              required
            />
          </label>
          <div className={styles.field}>
            Repos (minutes)
            <div className={styles.restInputs}>
              <select
                aria-label="Minutes de repos"
                name="restMinutes"
                defaultValue={Math.min(5, Math.floor(initial.restSeconds / 60))}
              >
                {[0, 1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <span aria-hidden="true">:</span>
              <select
                aria-label="Secondes de repos"
                name="restSeconds"
                defaultValue={(Math.round((initial.restSeconds % 60) / 5) * 5) % 60}
              >
                {Array.from({ length: 12 }, (_, i) => i * 5).map((s) => (
                  <option key={s} value={s}>
                    {String(s).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className={styles.field}>
            {loadInputLabel(equipment)}
            <input
              name="load"
              type="number"
              inputMode="decimal"
              min={0}
              max={2000}
              step={0.25}
              defaultValue={initial.loadKg}
              required
            />
          </label>
          <label className={styles.field}>
            Répétitions <span className={styles.optional}>facultatif</span>
            <input
              name="reps"
              type="number"
              inputMode="numeric"
              min={1}
              max={200}
              step={1}
              placeholder="—"
              defaultValue={initial.reps ?? ""}
            />
          </label>
        </div>
        <p className={styles.hint}>
          {equipment === "barbell"
            ? "Charge barre comprise."
            : equipment === "bodyweight"
              ? "0 kg = sans lest ajouté."
              : equipment === "dumbbell"
                ? "Indiquez le poids d’un seul haltère."
                : "Indiquez la charge affichée sur la machine ou la poulie."}
        </p>
        {formError && (
          <p className={styles.error} role="alert">
            {formError}
          </p>
        )}
        <div className={styles.actions}>
          <button className={styles.primary} type="submit">
            {minimumSets > 1 ? "Appliquer aux prochaines séries" : "Valider l’exercice"}
          </button>
          <button className={styles.secondary} type="button" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </form>
    </section>
  );
}

function Catalog({
  kind,
  favorites,
  onChoose,
}: {
  kind: SessionKind;
  favorites: ExerciseConfig[];
  onChoose: (c: ExerciseConfig) => void;
}) {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("");
  const [region, setRegion] = useState("");
  const [equipment, setEquipment] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<SessionKind>(kind);
  const base = searchExercises(sessionFilter);
  const availableMuscles = Object.entries(muscleLabels).filter(([id]) =>
    base.some((ex) => ex.primary === id || ex.secondary.some((m) => m === id)),
  );
  const regions = [...new Set(base.filter((ex) => ex.primary === muscle).map((ex) => ex.region))];
  const results = searchExercises(sessionFilter, query, muscle, region, equipment);
  const matchingFavorites = favorites.filter(
    (c) =>
      results.some((ex) => ex.id === c.exerciseId) && (!equipment || equipment === c.equipment),
  );
  return (
    <section className={styles.catalog} aria-labelledby="exercise-list-title">
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="exercise-list-title">Prochain exercice</h2>
        </div>
      </div>
      {(kind === "half" || kind === "ppl") && (
        <div className={styles.segment} aria-label="Filtrer les exercices par séance">
          {[
            kind,
            ...(kind === "half"
              ? (["upper", "lower"] as const)
              : (["push", "pull", "legs"] as const)),
          ].map((id) => (
            <button
              key={id}
              aria-pressed={sessionFilter === id}
              onClick={() => {
                setSessionFilter(id as SessionKind);
                setMuscle("");
                setRegion("");
              }}
            >
              {id === kind ? "Tout" : sessionLabels[id as SessionKind]}
            </button>
          ))}
        </div>
      )}
      <label className={styles.search}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 6 6" />
        </svg>
        <input
          type="search"
          aria-label="Rechercher un exercice"
          placeholder="Développé couché, squat…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className={styles.filters}>
        <label className={styles.field}>
          Muscle
          <select
            aria-label="Muscle"
            value={muscle}
            onChange={(e) => {
              setMuscle(e.target.value);
              setRegion("");
            }}
          >
            <option value="">Tous les muscles</option>
            {availableMuscles.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Matériel
          <select
            aria-label="Matériel"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          >
            <option value="">Tout le matériel</option>
            {Object.entries(equipmentLabels).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {regions.length > 1 && (
        <label className={styles.field}>
          Zone principale
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">Toutes les zones</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      )}
      <div className={styles.listMeta}>
        <span>{onlyFavorites ? matchingFavorites.length : results.length} résultat(s)</span>
        <button
          type="button"
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          {onlyFavorites ? "Tous les exercices" : "Mes favoris"}
        </button>
      </div>
      <div className={onlyFavorites ? styles.exerciseList : styles.exerciseGrid}>
        {onlyFavorites
          ? matchingFavorites.map((c) => (
              <button key={configKey(c)} className={styles.exerciseRow} onClick={() => onChoose(c)}>
                <span>
                  <strong>{exerciseName(c.exerciseId)}</strong>
                  <ConfigSummary config={c} />
                </span>
                <span aria-hidden="true">＋</span>
              </button>
            ))
          : results.map((ex) => (
              <button
                key={ex.id}
                className={styles.exerciseTile}
                aria-label={ex.name}
                onClick={() =>
                  onChoose({
                    ...defaultConfig(ex.id),
                    ...(equipment ? { equipment: equipment as Equipment } : {}),
                  })
                }
              >
                <ExerciseIcon exercise={ex} />
                <strong>{ex.name}</strong>
              </button>
            ))}
      </div>
      {(onlyFavorites ? !matchingFavorites.length : !results.length) && (
        <div className={styles.empty}>
          <h3>Aucun exercice ici</h3>
          <p>
            {onlyFavorites
              ? "Ajoutez une configuration avec l’étoile pendant votre séance, ou élargissez les filtres."
              : "Essayez un autre nom ou élargissez les filtres."}
          </p>
          <button
            className={styles.secondary}
            onClick={() => {
              setQuery("");
              setMuscle("");
              setRegion("");
              setEquipment("");
              setOnlyFavorites(false);
              setSessionFilter(kind);
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </section>
  );
}

const homeMenu = [
  ["training", "Séances", "Démarrer ou reprendre une séance"],
  ["history", "Historique", "Vos séances passées, exercice par exercice"],
  ["stats", "Statistiques", "Volume, progression et muscles travaillés"],
  ["favorites", "Favoris", "Exercices et séances enregistrés"],
  ["social", "Social", "Vos amis et leurs entraînements"],
] as const;

function HomeIcon({ id }: { id: (typeof homeMenu)[number][0] }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (id === "training")
    return (
      <svg {...common}>
        <path d="M4 9v6M20 9v6M7 6v12M17 6v12M7 12h10M2 11h2M22 11h-2" />
      </svg>
    );
  if (id === "history")
    return (
      <svg {...common}>
        <path d="M3 12a9 9 0 1 0 3-6.7M3 4v4h4M12 8v4l3 2" />
      </svg>
    );
  if (id === "stats")
    return (
      <svg {...common}>
        <path d="M5 21V10M12 21V4M19 21v-7M3 21h18" />
      </svg>
    );
  if (id === "favorites")
    return (
      <svg {...common}>
        <path d="m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2L3 9.6l6.2-.9Z" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 6M17 14.5a5.5 5.5 0 0 1 3.5 5.1" />
    </svg>
  );
}

export function SportApp() {
  const [store, setStore] = useState<SportStore | null>(null);
  const storeRef = useRef<SportStore | null>(null);
  const [error, setError] = useState("");
  const [readBlocked, setReadBlocked] = useState(false);
  const [tab, setTab] = useState<
    "home" | "training" | "history" | "stats" | "favorites" | "social"
  >("home");
  const { theme, selectTheme } = useThemeMode("dark");
  const [kind, setKind] = useState<Extract<SessionKind, "full" | "half" | "ppl">>("full");
  const [workoutType, setWorkoutType] = useState<"recommended" | "free">("recommended");
  const [workoutDuration, setWorkoutDuration] = useState<WorkoutDuration>("medium");
  const [editing, setEditing] = useState<{ config: ExerciseConfig; entryId?: string } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState(false);
  const [deleteHistory, setDeleteHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [feedbackEntryId, setFeedbackEntryId] = useState<string | null>(null);
  const [sessionFeedbackOpen, setSessionFeedbackOpen] = useState(false);
  const [photoViewer, setPhotoViewer] = useState<{ photos: string[]; index: number } | null>(null);
  const [notice, setNotice] = useState("");
  const [friendHistory, setFriendHistory] = useState<HistoryItem[]>([]);
  const [friendHistoryLoading, setFriendHistoryLoading] = useState(false);
  const timer = useRestTimer();
  const cloud = useSportCloud();
  useEffect(() => {
    const client = getCloud();
    const id = cloud.session?.user.id;
    if (tab !== "history" || !client || !id || !cloud.profile) {
      setFriendHistory([]);
      return;
    }
    let live = true;
    setFriendHistoryLoading(true);
    void (async () => {
      try {
        const { data: relations, error: relationsError } = await client
          .from("friendships")
          .select("requester,recipient,accepted_at")
          .or(`requester.eq.${id},recipient.eq.${id}`)
          .not("accepted_at", "is", null);
        if (relationsError) throw relationsError;
        const friendIds = [
          ...new Set(
            ((relations ?? []) as { requester: string; recipient: string }[]).map((friend) =>
              friend.requester === id ? friend.recipient : friend.requester,
            ),
          ),
        ];
        if (!friendIds.length) {
          if (live) setFriendHistory([]);
          return;
        }
        const [{ data: profiles, error: profilesError }, { data: sessions, error: sessionsError }] =
          await Promise.all([
            client.from("profiles").select("id,username").in("id", friendIds),
            client
              .from("sport_sessions")
              .select("user_id,payload")
              .in("user_id", friendIds)
              .order("ended_at", { ascending: false })
              .limit(100),
          ]);
        if (profilesError) throw profilesError;
        if (sessionsError) throw sessionsError;
        const usernames = Object.fromEntries(
          (profiles ?? []).map((profile) => [profile.id, profile.username]),
        );
        const items = (sessions ?? []).flatMap((row) => {
          const parsed = storeSchema.shape.history.element.safeParse(row.payload);
          return parsed.success
            ? [
                {
                  session: parsed.data,
                  ownerId: row.user_id,
                  username: usernames[row.user_id] ?? "joueur",
                  isFriend: true,
                },
              ]
            : [];
        });
        if (live) setFriendHistory(items);
      } catch (error) {
        if (live) {
          setFriendHistory([]);
          setNotice(friendlyError(error));
        }
      } finally {
        if (live) setFriendHistoryLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [cloud.profile, cloud.session, tab]);
  useEffect(() => {
    // Defer hydration so server and initial browser markup agree.
    let mounted = true;
    void Promise.resolve().then(() => {
      if (!mounted) return;
      const loaded = loadStore();
      storeRef.current = loaded.store;
      setStore(loaded.store);
      setError(loaded.error);
      setReadBlocked(Boolean(loaded.error));
      if (new URLSearchParams(window.location.search).get("social") === "1") setTab("social");
    });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!photoViewer) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhotoViewer(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [photoViewer]);
  function update(transform: (current: SportStore) => SportStore) {
    if (!storeRef.current || readBlocked) return;
    const next = transform(storeRef.current);
    const saved = saveStore(next);
    setError(
      saved
        ? ""
        : "Sauvegarde impossible : vos modifications restent en mémoire. Libérez du stockage et réessayez avant de fermer cette page.",
    );
    storeRef.current = next;
    setStore(next);
  }
  function updateEntry(id: string, transform: (entry: ExerciseEntry) => ExerciseEntry) {
    update((s) =>
      s.active
        ? {
            ...s,
            active: {
              ...s.active,
              exercises: s.active.exercises.map((e) => (e.id === id ? transform(e) : e)),
            },
          }
        : s,
    );
  }
  function toggleFavorite(config: ExerciseConfig) {
    update((s) => ({
      ...s,
      favorites: s.favorites.some((c) => configKey(c) === configKey(config))
        ? s.favorites.filter((c) => configKey(c) !== configKey(config))
        : [...s.favorites, { ...config }],
    }));
  }
  function start(
    kind: SessionKind,
    configs: ExerciseConfig[] = [],
    name?: string,
    source: "free" | "recommended" = "free",
  ) {
    if (storeRef.current?.active) {
      setTab("training");
      setNotice("Votre séance en cours vous attend. Terminez-la avant d’en commencer une autre.");
      return;
    }
    update((s) => ({ ...s, active: createSession(kind, configs, name, source) }));
    timer.stop();
    setEditing(null);
    setFeedbackEntryId(null);
    setSessionFeedbackOpen(false);
    setTab("training");
    setNotice("");
    setDetailId(null);
  }
  function toggleTemplate(session: Session) {
    update((s) => ({
      ...s,
      templates: s.templates.some((t) => t.id === session.id)
        ? s.templates.filter((t) => t.id !== session.id)
        : [
            ...s.templates,
            {
              id: session.id,
              name: `${session.name || sessionLabels[session.kind]} · ${dateLabel(session.startedAt)}`,
              kind: session.kind,
              exercises: session.exercises.map((e) => ({ ...e.config })),
            },
          ],
    }));
  }
  if (!store)
    return (
      <main className={styles.shell}>
        <p role="status">Ouverture du carnet…</p>
      </main>
    );
  const active = store.active;
  const current = active?.exercises.find((e) => !e.finished);
  const feedbackEntry =
    active?.exercises.find((e) => e.id === feedbackEntryId) ??
    active?.exercises.find(
      (e) => e.finished && e.completedSets.length === e.config.sets && !e.feedback,
    );
  const allHistoryItems: HistoryItem[] = [
    ...store.history.map((session) => ({
      session,
      ownerId: cloud.session?.user.id ?? "local",
      username: cloud.profile?.username ?? "moi",
      isFriend: false,
    })),
    ...friendHistory,
  ].sort(
    (a, b) => new Date(b.session.startedAt).getTime() - new Date(a.session.startedAt).getTime(),
  );
  const historyItems = allHistoryItems.filter((item) =>
    historyFilter === "all" ? true : historyFilter === "friends" ? item.isFriend : !item.isFriend,
  );
  const detailItem = historyItems.find((item) => item.session.id === detailId);
  const detail = detailItem?.session;
  const detailIsFriend = detailItem?.isFriend ?? false;
  const totalSets = active?.exercises.reduce((sum, e) => sum + e.completedSets.length, 0) ?? 0;
  const isFavorite = (c: ExerciseConfig) =>
    store.favorites.some((f) => configKey(f) === configKey(c));
  function saveActiveSession(feedback?: FeedbackFormValue) {
    if (!active) return;
    const finished = finishSession(feedback ? { ...active, feedback } : active);
    update((s) => ({
      ...s,
      active: null,
      history: finished.exercises.length ? [finished, ...s.history] : s.history,
    }));
    timer.stop();
    setConfirmFinish(false);
    setSessionFeedbackOpen(false);
    setEditing(null);
    setNotice(
      finished.exercises.length ? "Séance enregistrée. Bien joué !" : "Séance vide fermée.",
    );
    if (finished.exercises.length) {
      setTab("history");
      setDetailId(finished.id);
    }
  }

  return (
    <main className={styles.shell} data-theme={theme}>
      <header className={styles.header}>
        {tab === "home" ? (
          <Link href="/" className={styles.back} aria-label="Retour aux jeux AntaVerse">
            ← <span>AntaVerse</span>
          </Link>
        ) : (
          <button
            type="button"
            className={styles.back}
            onClick={() => {
              setTab("home");
              setDetailId(null);
              setEditing(null);
              setEditHistory(false);
              setDeleteHistory(false);
              setConfirmFinish(false);
              setNotice("");
            }}
          >
            ← <span>Accueil</span>
          </button>
        )}
        <span className={styles.wordmark}>
          <SportIcon /> SPORT
        </span>
        <button
          className={styles.themeButton}
          aria-label={theme === "dark" ? "Mode clair" : "Mode sombre"}
          onClick={() => selectTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀" : "◐"}
        </button>
      </header>
      <nav className={styles.nav} aria-label="Carnet de sport" hidden={tab === "home"}>
        {(
          [
            ["training", "Séance"],
            ["history", "Historique"],
            ["stats", "Statistiques"],
            ["favorites", "Favoris"],
            ["social", "Social"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => {
              setTab(id);
              if (id === "training" && !active) setWorkoutType("recommended");
              setDetailId(null);
              setEditHistory(false);
              setDeleteHistory(false);
              setConfirmFinish(false);
            }}
          >
            {label}
            {id === "training" && active && <span className={styles.dot} aria-label="en cours" />}
          </button>
        ))}
      </nav>
      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          {!readBlocked && (
            <button className={styles.secondary} onClick={() => update((s) => s)}>
              Réessayer la sauvegarde
            </button>
          )}
        </div>
      )}
      <p className={styles.notice} role="status">
        {notice}
      </p>
      {readBlocked ? (
        <div className={styles.empty}>
          <h1>Carnet indisponible</h1>
          <p>Rechargez la page pour réessayer de lire vos données.</p>
        </div>
      ) : (
        <>
          {tab === "home" && (
            <section className={styles.home}>
              <div className={styles.homeHero}>
                <div className={styles.homeMark} aria-hidden="true">
                  <SportIcon />
                </div>
                <h1>Carnet de sport</h1>
              </div>
              <div className={styles.homeMenu}>
                {homeMenu.map(([id, label, desc]) => (
                  <button
                    key={id}
                    type="button"
                    className={styles.homeButton}
                    onClick={() => {
                      setTab(id);
                      if (id === "training" && !active) setWorkoutType("recommended");
                      setDetailId(null);
                      setEditing(null);
                      setEditHistory(false);
                      setDeleteHistory(false);
                      setConfirmFinish(false);
                      setNotice("");
                    }}
                  >
                    <span className={styles.homeButtonIcon}>
                      <HomeIcon id={id} />
                    </span>
                    <span className={styles.homeButtonText}>
                      <strong>
                        {label}
                        {id === "training" && active && (
                          <span className={styles.dot} aria-label="séance en cours" />
                        )}
                      </strong>
                      <span>{desc}</span>
                    </span>
                    <span className={styles.homeButtonChevron} aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}
          {tab === "training" && !active && (
            <>
              <section className={styles.hero}>
                <h1>Nouvelle séance</h1>
                <div className={styles.heroMark} aria-hidden="true">
                  <SportIcon />
                </div>
              </section>
              <section className={styles.panel}>
                <h2>Format de séance</h2>
                <div className={styles.segment} aria-label="Format d’entraînement">
                  {(
                    [
                      ["full", "Full body"],
                      ["half", "Half body"],
                      ["ppl", "Push Pull Legs"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      aria-label={label}
                      aria-pressed={kind === id}
                      onClick={() => setKind(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <h2>Construction de séance</h2>
                <div className={styles.segment} aria-label="Type d’entraînement">
                  <button
                    aria-label="Séances recommandées"
                    aria-pressed={workoutType === "recommended"}
                    onClick={() => setWorkoutType("recommended")}
                  >
                    Séances recommandées
                  </button>
                  <button
                    aria-label="Entraînement libre"
                    aria-pressed={workoutType === "free"}
                    onClick={() => setWorkoutType("free")}
                  >
                    Entraînement libre
                  </button>
                </div>
                {workoutType === "recommended" ? (
                  <div className={styles.recommendedSetup}>
                    <h3>Durée disponible</h3>
                    <div className={styles.segment} aria-label="Durée de l’entraînement">
                      {(
                        Object.entries(workoutDurations) as [
                          WorkoutDuration,
                          (typeof workoutDurations)[WorkoutDuration],
                        ][]
                      ).map(([id, duration]) => (
                        <button
                          key={id}
                          aria-pressed={workoutDuration === id}
                          onClick={() => setWorkoutDuration(id)}
                        >
                          {duration.label}
                          <br />
                          <small>{duration.minutes} min</small>
                        </button>
                      ))}
                    </div>
                    <div className={styles.recommendedList}>
                      {recommendedWorkoutsFor(kind, workoutDuration).map((workout) => (
                        <button
                          className={styles.recommendedWorkout}
                          key={workout.id}
                          onClick={() =>
                            start(
                              workout.kind,
                              configsForRecommendedWorkout(workout),
                              workout.name,
                              "recommended",
                            )
                          }
                        >
                          <span>
                            <strong>{workout.name}</strong>
                            <em>
                              {workout.exercises.length} exercices ·{" "}
                              {workoutDurations[workout.duration].minutes} min environ
                            </em>
                          </span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : workoutType === "free" ? (
                  <button className={styles.primary} onClick={() => start(kind)}>
                    Commencer ma séance <span aria-hidden="true">→</span>
                  </button>
                ) : null}
              </section>
              {!cloud.profile && (
                <section className={styles.panel} aria-labelledby="social-invite">
                  <h2 id="social-invite">Social</h2>
                  <p className={styles.hint}>
                    Retrouvez vos amis, consultez leurs séances et encouragez-les après un
                    entraînement.
                  </p>
                  <Link className={styles.secondary} href="/sport/compte">
                    {cloud.session ? "Choisir mon pseudo" : "Me connecter pour retrouver mes amis"}
                  </Link>
                </section>
              )}
            </>
          )}
          {tab === "training" && active && (
            <>
              <div className={styles.sessionHeading}>
                <div>
                  <p className={styles.eyebrow}>Séance en cours · {dateLabel(active.startedAt)}</p>
                  <h1>{active.name || sessionLabels[active.kind]}</h1>
                  {active.name && (
                    <p className={styles.sessionFormat}>{sessionLabels[active.kind]}</p>
                  )}
                </div>
                <button
                  className={styles.secondary}
                  aria-label="Terminer ma séance"
                  disabled={Boolean(feedbackEntry) || sessionFeedbackOpen}
                  onClick={() => {
                    timer.stop();
                    setConfirmFinish(true);
                  }}
                >
                  Terminer
                </button>
              </div>
              {confirmFinish ? null : feedbackEntry ? (
                <FeedbackForm
                  eyebrow="Exercice terminé"
                  title={`Comment s’est passé ${exerciseName(feedbackEntry.config.exerciseId)} ?`}
                  commentPlaceholder="Une remarque sur l’exercice ?"
                  nextLabel={
                    active.exercises.some((entry) => !entry.finished && entry.id !== feedbackEntry.id)
                      ? "Passer à l’exercice suivant"
                      : "Retourner à la liste des exercices"
                  }
                  onSubmit={(feedback) => {
                    updateEntry(feedbackEntry.id, (entry) => ({ ...entry, feedback }));
                    setFeedbackEntryId(null);
                    setNotice("Ressenti enregistré.");
                  }}
                />
              ) : editing ? (
                <ConfigForm
                  key={`${editing.entryId ?? "new"}-${configKey(editing.config)}`}
                  initial={editing.config}
                  minimumSets={
                    editing.entryId
                      ? (active.exercises.find((e) => e.id === editing.entryId)?.completedSets
                          .length ?? 0) + 1
                      : 1
                  }
                  onCancel={() => setEditing(null)}
                  onSubmit={(config) => {
                    if (editing.entryId) updateEntry(editing.entryId, (e) => ({ ...e, config }));
                    else
                      update((s) =>
                        s.active
                          ? {
                              ...s,
                              active: {
                                ...s.active,
                                exercises: [...s.active.exercises, createEntry(config)],
                              },
                            }
                          : s,
                      );
                    setEditing(null);
                    setNotice("");
                  }}
                />
              ) : current ? (
                <section
                  className={`${styles.workout} ${styles.guidedWorkout}`}
                  aria-label="Exercice en cours"
                >
                  <header className={styles.workoutHeader}>
                    <div className={styles.workoutIdentity}>
                      <h2>{exerciseName(current.config.exerciseId)}</h2>
                    </div>
                    <div className={styles.workoutTools}>
                      <Star
                        selected={isFavorite(current.config)}
                        label="Configuration favorite"
                        onClick={() => toggleFavorite(current.config)}
                      />
                    </div>
                  </header>
                  <div className={styles.workoutFocus}>
                    <div className={styles.guidedFocusTop}>
                      <div className={styles.quickProgress}>
                        <div
                          className={`${styles.sets} ${styles.quickSets}`}
                          aria-label={`${current.completedSets.length} séries sur ${current.config.sets} effectuées`}
                        >
                          {Array.from({ length: current.config.sets }, (_, i) => (
                            <span
                              key={i}
                              className={
                                i < current.completedSets.length
                                  ? styles.setDone
                                  : i === current.completedSets.length
                                    ? styles.setCurrent
                                    : ""
                              }
                            >
                              {i < current.completedSets.length ? "✓" : i + 1}
                            </span>
                          ))}
                        </div>
                      </div>
                      {active.source === "recommended" && (
                        <label className={styles.quickLoad}>
                          <span>{loadInputLabel(current.config.equipment)}</span>
                          <input
                            aria-label={`Charge pour ${exerciseName(current.config.exerciseId)}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={2000}
                            step={0.25}
                            value={current.config.loadKg}
                            onChange={(event) => {
                              const loadKg = Number(event.target.value);
                              if (!Number.isFinite(loadKg) || loadKg < 0 || loadKg > 2000) return;
                              updateEntry(current.id, (entry) => ({
                                ...entry,
                                config: { ...entry.config, loadKg },
                              }));
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className={styles.timerRow}>
                      <div className={styles.timer}>
                        <span className={styles.timerLabel}>Repos</span>
                        <div
                          className={styles.clock}
                          role="timer"
                          aria-label="Temps de repos restant"
                        >
                          {timer.remaining === null
                            ? timeLabel(current.config.restSeconds)
                            : timeLabel(timer.remaining)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {timer.remaining !== null && timer.remaining > 0 ? (
                    <button className={styles.primary} onClick={timer.stop}>
                      Passer le repos
                    </button>
                  ) : (
                    <button
                      className={styles.primary}
                      onClick={() => {
                        const latest = storeRef.current?.active?.exercises.find(
                          (e) => e.id === current.id,
                        );
                        if (!latest || latest.finished) return;
                        const next = completeSet(latest);
                        updateEntry(current.id, () => next);
                        if (next.finished) {
                          timer.stop();
                          setFeedbackEntryId(current.id);
                          setNotice("");
                        } else timer.start(current.config.restSeconds);
                      }}
                    >
                      {current.completedSets.length + 1 === current.config.sets
                        ? "Dernière série terminée ✓"
                        : "Série terminée · démarrer le repos"}
                    </button>
                  )}
                  <div className={`${styles.actions} ${styles.workoutActions}`}>
                    <button
                      className={styles.textButton}
                      onClick={() => timer.start(current.config.restSeconds)}
                    >
                      {timer.remaining !== null && timer.remaining > 0
                        ? "Recommencer le repos"
                        : "Démarrer le chrono"}
                    </button>
                    <button
                      className={styles.textButton}
                      onClick={() => setEditing({ config: current.config, entryId: current.id })}
                    >
                      Modifier les réglages
                    </button>
                    {current.completedSets.length > 0 && (
                      <button
                        className={styles.secondary}
                        onClick={() => {
                          timer.stop();
                          updateEntry(current.id, (e) => ({
                            ...e,
                            completedSets: e.completedSets.slice(0, -1),
                            finished: false,
                          }));
                        }}
                      >
                        Annuler la dernière série
                      </button>
                    )}
                    <button
                      className={styles.secondary}
                      onClick={() => {
                        timer.stop();
                        updateEntry(current.id, (e) => ({ ...e, finished: true }));
                        setNotice("Exercice arrêté. Seules les séries validées seront conservées.");
                      }}
                    >
                      Arrêter cet exercice
                    </button>
                  </div>
                </section>
              ) : !confirmFinish ? (
                <Catalog
                  kind={active.kind}
                  favorites={store.favorites}
                  onChoose={(config) => setEditing({ config })}
                />
              ) : null}
              {!feedbackEntryId && active.source === "recommended" && (
                <details className={`${styles.recap} ${styles.programRecap}`} open>
                  <summary>Programme de la séance · {active.exercises.length} exercices</summary>
                  <ol className={styles.programList}>
                    {active.exercises.map((entry, index) => {
                      const status = entry.finished
                        ? "Terminé"
                        : entry.id === current?.id
                          ? "En cours"
                          : "À venir";
                      return (
                        <li key={entry.id} data-status={status}>
                          <span>{index + 1}</span>
                          <div>
                            <strong>{exerciseName(entry.config.exerciseId)}</strong>
                            <small>
                              {entry.config.sets} séries × {entry.config.reps ?? "—"} rép. · repos{" "}
                              {timeLabel(entry.config.restSeconds)}
                            </small>
                          </div>
                          <em>{status}</em>
                        </li>
                      );
                    })}
                  </ol>
                </details>
              )}
              {!feedbackEntryId && active.exercises.some((e) => e.finished) && (
                <details className={styles.recap}>
                  <summary>
                    Dans cette séance · {active.exercises.filter((e) => e.finished).length}{" "}
                    exercice(s) terminé(s)
                  </summary>
                  {active.exercises
                    .filter((e) => e.finished)
                    .map((e) => (
                      <div key={e.id} className={styles.recapRow}>
                        <div>
                          <strong>{exerciseName(e.config.exerciseId)}</strong>
                          <p>
                            {e.completedSets.length}/{e.config.sets} séries · {loadLabel(e.config)}
                          </p>
                        </div>
                        <Star
                          selected={isFavorite(e.config)}
                          label={`Favori : ${exerciseName(e.config.exerciseId)}`}
                          onClick={() => toggleFavorite(e.config)}
                        />
                        {!current && e.completedSets.length > 0 && (
                          <button
                            className={styles.textButton}
                            onClick={() => {
                              setEditing(null);
                              updateEntry(e.id, (entry) => ({
                                ...entry,
                                finished: false,
                                completedSets: entry.completedSets.slice(0, -1),
                              }));
                              setNotice("Dernière série annulée.");
                            }}
                          >
                            Annuler la dernière série
                          </button>
                        )}
                      </div>
                    ))}
                </details>
              )}
              {confirmFinish ? (
                <section className={styles.confirm} aria-label="Terminer la séance">
                  {sessionFeedbackOpen ? (
                  <FeedbackForm
                    eyebrow="Séance terminée"
                    title="Comment s’est passée votre séance ?"
                    commentPlaceholder="Une remarque sur la séance ?"
                    allowPhotos
                      nextLabel="Enregistrer la séance"
                      onSubmit={saveActiveSession}
                    />
                  ) : (
                    <>
                      <h2>
                        {totalSets ? "Enregistrer cette séance ?" : "Quitter cette séance vide ?"}
                      </h2>
                      <p>
                        {totalSets
                          ? `${totalSets} série(s) validée(s) seront conservées. Les séries non effectuées ne seront pas comptées.`
                          : "Aucune série n’a été validée. Rien ne sera ajouté à l’historique."}
                      </p>
                      <div className={styles.actions}>
                        <button
                          className={styles.primary}
                          onClick={() => {
                            if (totalSets) setSessionFeedbackOpen(true);
                            else saveActiveSession();
                          }}
                        >
                          {totalSets ? "Enregistrer et terminer" : "Quitter la séance"}
                        </button>
                        <button className={styles.secondary} onClick={() => setConfirmFinish(false)}>
                          Continuer ma séance
                        </button>
                        {totalSets > 0 && (
                          <button
                            className={styles.secondary}
                            onClick={() => {
                              update((s) => ({ ...s, active: null }));
                              timer.stop();
                              setConfirmFinish(false);
                              setEditing(null);
                              setSessionFeedbackOpen(false);
                              setNotice("Séance quittée sans ajout à l’historique.");
                            }}
                          >
                            Quitter sans enregistrer
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </section>
              ) : null}
            </>
          )}
          {tab === "history" && (
            <>
              <div className={styles.pageHeading}>
                <h1>Historique</h1>
              </div>
              <div
                className={`${styles.segment} ${styles.historyFilters}`}
                role="group"
                aria-label="Filtrer les séances"
              >
                {(
                  [
                    ["all", "Tout"],
                    ["mine", "Moi uniquement"],
                    ["friends", "Mes amis"],
                  ] as const
                ).map(([filter, label]) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={historyFilter === filter}
                    onClick={() => setHistoryFilter(filter)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {detail && editHistory ? (
                <HistoryEditor
                  key={detail.id}
                  session={detail}
                  onCancel={() => setEditHistory(false)}
                  onSave={(updated) => {
                    update((s) => ({
                      ...s,
                      history: s.history.map((item) => (item.id === updated.id ? updated : item)),
                    }));
                    setEditHistory(false);
                    setNotice("Séance modifiée.");
                  }}
                />
              ) : detail ? (
                <>
                  <button
                    className={styles.textButton}
                    onClick={() => {
                      setDetailId(null);
                      setDeleteHistory(false);
                    }}
                  >
                    ← Toutes les séances
                  </button>
                  <section className={styles.panel}>
                    <div className={styles.sectionHeading}>
                      <div>
                        <p className={styles.eyebrow}>{dateLabel(detail.startedAt)}</p>
                        <p
                          className={
                            detailIsFriend ? styles.friendHistoryOwner : styles.historyOwner
                          }
                        >
                          @{detailItem?.username}
                        </p>
                        <h2>{detail.name || sessionLabels[detail.kind]}</h2>
                      </div>
                      {!detailIsFriend && (
                        <Star
                          selected={store.templates.some((t) => t.id === detail.id)}
                          label="Séance favorite"
                          onClick={() => toggleTemplate(detail)}
                        />
                      )}
                    </div>
                    <p className={styles.hint}>
                      {detail.exercises.length} exercices ·{" "}
                      {detail.exercises.reduce((sum, e) => sum + e.completedSets.length, 0)} séries
                      effectuées
                    </p>
                    {detail.feedback?.photos && detail.feedback.photos.length > 0 && (
                      <div className={styles.historyPhotoGallery} aria-label="Photos de la séance">
                        {detail.feedback.photos.map((photo, index) => (
                          <button
                            key={photo}
                            type="button"
                            className={styles.historyPhotoButton}
                            aria-label={`Agrandir la photo ${index + 1}`}
                            onClick={() =>
                              setPhotoViewer({ photos: detail.feedback?.photos ?? [], index })
                            }
                          >
                            <img src={photo} alt={`Photo de la séance ${index + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                    {detailIsFriend && detailItem && (
                      <SessionReactions
                        ownerId={detailItem.ownerId}
                        ownerName={detailItem.username}
                        sessionId={detail.id}
                      />
                    )}
                    {detail.exercises.map((e) => (
                      <div className={styles.historyExercise} key={e.id}>
                        <div className={styles.sectionHeading}>
                          <h3>
                            {exerciseName(e.config.exerciseId)}
                            {e.feedback && (
                              <span
                                className={`${styles.historyFeedback} ${feedbackColorClass(e.feedback.mood)}`}
                                title={`Ressenti : ${e.feedback.mood}`}
                                aria-label={`Ressenti : ${e.feedback.mood}`}
                              >
                                {feedbackEmojiByMood[e.feedback.mood]}
                              </span>
                            )}
                          </h3>
                          <Star
                            selected={isFavorite(e.config)}
                            label={`Favori : ${exerciseName(e.config.exerciseId)}`}
                            onClick={() => toggleFavorite(e.config)}
                          />
                        </div>
                        <p>
                          {equipmentLabels[e.config.equipment]} · repos prévu{" "}
                          {timeLabel(e.config.restSeconds)}
                        </p>
                        {e.feedback?.comment.trim() && (
                          <p className={styles.historyComment}>{e.feedback.comment}</p>
                        )}
                        <ol>
                          {e.completedSets.map((set, i) => (
                            <li key={i}>
                              <span>Série {i + 1}</span>
                              <strong>
                                {equipmentLabels[set.equipment]} ·{" "}
                                {loadLabel({
                                  ...e.config,
                                  equipment: set.equipment,
                                  loadKg: set.loadKg,
                                })}
                                {set.reps ? ` · ${set.reps} rép.` : ""}
                              </strong>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                    {!detailIsFriend && (
                      <>
                        <button
                          className={styles.primary}
                          onClick={() =>
                            start(
                              detail.kind,
                              detail.exercises.map((e) => e.config),
                            )
                          }
                        >
                          Refaire cette séance
                        </button>
                        <div className={styles.actions}>
                          <button
                            className={styles.textButton}
                            onClick={() => {
                              setEditHistory(true);
                              setDeleteHistory(false);
                            }}
                          >
                            Modifier cette séance
                          </button>
                          <button
                            className={styles.textButton}
                            onClick={() => setDeleteHistory(true)}
                          >
                            Supprimer cette séance
                          </button>
                        </div>
                      </>
                    )}
                    {!detailIsFriend && deleteHistory && (
                      <div className={styles.confirm}>
                        <h3>Supprimer de l’historique ?</h3>
                        <p>Cette séance sera supprimée définitivement.</p>
                        <div className={styles.actions}>
                          <button
                            className={styles.secondary}
                            onClick={() => setDeleteHistory(false)}
                          >
                            Annuler
                          </button>
                          <button
                            className={styles.primary}
                            onClick={() => {
                              update((s) => ({
                                ...s,
                                history: s.history.filter((item) => item.id !== detail.id),
                              }));
                              setDetailId(null);
                              setDeleteHistory(false);
                              setNotice("Séance supprimée de l’historique.");
                            }}
                          >
                            Confirmer la suppression
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              ) : historyItems.length ? (
                <div className={styles.exerciseList}>
                  {historyItems.map((item) => (
                    <button
                      className={`${styles.exerciseRow} ${item.isFriend ? styles.friendHistoryRow : ""}`}
                      key={`${item.ownerId}:${item.session.id}`}
                      onClick={() => setDetailId(item.session.id)}
                    >
                      <span>
                        <span>{dateLabel(item.session.startedAt)}</span>
                        <span
                          className={
                            item.isFriend ? styles.friendHistoryOwner : styles.historyOwner
                          }
                        >
                          @{item.username}
                        </span>
                        <strong>
                          {item.session.name || sessionLabels[item.session.kind]}
                          {item.session.feedback && (
                            <span
                              className={`${styles.historyFeedback} ${feedbackColorClass(item.session.feedback.mood)}`}
                              title={`Ressenti : ${item.session.feedback.mood}`}
                              aria-label={`Ressenti : ${item.session.feedback.mood}`}
                            >
                              {feedbackEmojiByMood[item.session.feedback.mood]}
                            </span>
                          )}
                        </strong>
                        {item.session.feedback?.comment.trim() && (
                          <span className={styles.historySummaryComment}>
                            {item.session.feedback.comment}
                          </span>
                        )}
                        <span>
                          {item.session.exercises.length} exercices ·{" "}
                          {item.session.exercises.reduce(
                            (sum, e) => sum + e.completedSets.length,
                            0,
                          )}{" "}
                          séries
                        </span>
                        {item.session.feedback?.photos && item.session.feedback.photos.length > 0 && (
                          <span className={styles.historyThumbnails} aria-label="Photos de la séance">
                            {item.session.feedback.photos.map((photo, index) => (
                              <img
                                key={photo}
                                src={photo}
                                alt={`Photo ${index + 1} de la séance`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setPhotoViewer({
                                    photos: item.session.feedback?.photos ?? [],
                                    index,
                                  });
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>
                  ))}
                </div>
              ) : friendHistoryLoading && historyFilter !== "mine" ? (
                <p role="status" className={styles.emptySmall}>
                  Chargement des séances de vos amis…
                </p>
              ) : (
                <div className={styles.empty}>
                  <SportIcon />
                  <h2>
                    {historyFilter === "friends" ? "Aucune séance d’ami" : "Le début de votre carnet"}
                  </h2>
                  <p>
                    {historyFilter === "friends"
                      ? "Les séances de vos amis apparaîtront ici lorsqu’ils auront partagé un entraînement."
                      : "Vos séances terminées apparaîtront ici, avec les exercices, les charges et les séries effectuées."}
                  </p>
                  {historyFilter !== "friends" && (
                    <button className={styles.primary} onClick={() => setTab("training")}>
                      Commencer une séance
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {tab === "stats" && <StatsDashboard history={store.history} />}
          {tab === "social" && (
            <>
              <div className={styles.pageHeading}>
                <h1>Social</h1>
              </div>
              <SportSocial
                onOpenHistory={(sessionId) => {
                  setDetailId(sessionId);
                  setEditHistory(false);
                  setDeleteHistory(false);
                  setTab("history");
                }}
              />
            </>
          )}
          {tab === "favorites" && (
            <>
              <div className={styles.pageHeading}>
                <h1>Vos favoris</h1>
              </div>
              <h2 className={styles.subheading}>
                Exercices <span>{store.favorites.length}</span>
              </h2>
              {store.favorites.length ? (
                store.favorites.map((c) => (
                  <div className={styles.favoriteRow} key={configKey(c)}>
                    <div>
                      <h3>{exerciseName(c.exerciseId)}</h3>
                      <ConfigSummary config={c} />
                    </div>
                    <Star
                      selected
                      label={`Retirer le favori ${exerciseName(c.exerciseId)}`}
                      onClick={() => toggleFavorite(c)}
                    />
                    <button
                      className={styles.secondary}
                      onClick={() => {
                        if (storeRef.current?.active) {
                          if (current) {
                            setNotice("Terminez l’exercice en cours avant d’en ajouter un autre.");
                            setTab("training");
                            return;
                          }
                          setEditing({ config: c });
                          setTab("training");
                        } else {
                          start(kind);
                          setEditing({ config: c });
                        }
                      }}
                    >
                      Utiliser
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptySmall}>
                  Touchez l’étoile d’un exercice pour garder sa charge, ses séries et son repos.
                </p>
              )}
              <h2 className={styles.subheading}>
                Séances <span>{store.templates.length}</span>
              </h2>
              {store.templates.length ? (
                store.templates.map((t) => (
                  <div className={styles.favoriteRow} key={t.id}>
                    <div>
                      <h3>{t.name}</h3>
                      <p>{t.exercises.length} exercices · réglages inclus</p>
                    </div>
                    <Star
                      selected
                      label={`Retirer la séance favorite ${t.name}`}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          templates: s.templates.filter((item) => item.id !== t.id),
                        }))
                      }
                    />
                    <button className={styles.secondary} onClick={() => start(t.kind, t.exercises)}>
                      Démarrer cette séance
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptySmall}>
                  Ajoutez une séance à vos favoris depuis son détail dans l’historique.
                </p>
              )}
            </>
          )}
          {photoViewer && (
            <div
              className={styles.photoLightbox}
              role="dialog"
              aria-modal="true"
              aria-label="Photo agrandie"
              onClick={() => setPhotoViewer(null)}
            >
              <button
                type="button"
                className={styles.photoLightboxClose}
                aria-label="Fermer la photo"
                autoFocus
                onClick={() => setPhotoViewer(null)}
              >
                ×
              </button>
              <div className={styles.photoLightboxContent} onClick={(event) => event.stopPropagation()}>
                {photoViewer.photos.length > 1 && (
                  <button
                    type="button"
                    className={styles.photoLightboxNav}
                    aria-label="Photo précédente"
                    onClick={() =>
                      setPhotoViewer((current) =>
                        current
                          ? {
                              ...current,
                              index:
                                (current.index - 1 + current.photos.length) % current.photos.length,
                            }
                          : null,
                      )
                    }
                  >
                    ‹
                  </button>
                )}
                <img
                  className={styles.photoLightboxImage}
                  src={photoViewer.photos[photoViewer.index]}
                  alt={`Photo agrandie ${photoViewer.index + 1}`}
                />
                {photoViewer.photos.length > 1 && (
                  <button
                    type="button"
                    className={styles.photoLightboxNav}
                    aria-label="Photo suivante"
                    onClick={() =>
                      setPhotoViewer((current) =>
                        current
                          ? { ...current, index: (current.index + 1) % current.photos.length }
                          : null,
                      )
                    }
                  >
                    ›
                  </button>
                )}
              </div>
              <p className={styles.photoLightboxCounter}>
                {photoViewer.index + 1} / {photoViewer.photos.length}
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
