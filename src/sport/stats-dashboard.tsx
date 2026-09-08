"use client";

import { useEffect, useMemo, useState } from "react";
import { muscleLabels, sessionLabels, type Muscle } from "./catalog";
import type { Session } from "./model";
import {
  formatStatNumber,
  getExerciseProgress,
  getRhythmBuckets,
  getSportStats,
  percentageChange,
  type ProgressPoint,
  type RhythmUnit,
  type StatsRange,
} from "./stats";
import { getExerciseProgressions } from "./progression";
import { ProgressionBadge } from "./progression-badge";
import styles from "./sport.module.css";

const rangeLabels: Record<StatsRange, string> = {
  "30d": "30 jours",
  "90d": "3 mois",
  all: "Tout",
};

const shortDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));

function formatSignedPercent(value: number | null) {
  if (value === null) return "—";
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded} %`;
}

const rhythmUnitLabels: Record<RhythmUnit, string> = {
  day: "par jour",
  week: "par semaine",
  month: "par mois",
};

function MiniBars({
  values,
  unit,
}: {
  values: { label: string; count: number }[];
  unit: RhythmUnit;
}) {
  const maximum = Math.max(1, ...values.map((value) => value.count));
  return (
    <div
      className={styles.miniBars}
      style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}
      aria-label={`Séances ${rhythmUnitLabels[unit]}`}
    >
      {values.map((value) => (
        <div className={styles.miniBar} key={value.label}>
          <span className={styles.barValue}>{value.count || ""}</span>
          <span
            className={styles.barColumn}
            style={{ height: `${Math.max(value.count ? 14 : 3, (value.count / maximum) * 100)}%` }}
            aria-hidden="true"
          />
          <span>{value.label}</span>
        </div>
      ))}
    </div>
  );
}

function MuscleDistribution({ muscles }: { muscles: { muscle: Muscle; sets: number }[] }) {
  const topMuscles = muscles.slice(0, 5);
  const maximum = Math.max(1, ...topMuscles.map((item) => item.sets));
  return (
    <div className={styles.muscleRows}>
      {topMuscles.map(({ muscle, sets }) => (
        <div className={styles.muscleRow} key={muscle}>
          <span>{muscleLabels[muscle]}</span>
          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${(sets / maximum) * 100}%` }} />
          </div>
          <strong>{formatStatNumber(sets, 1)}</strong>
        </div>
      ))}
    </div>
  );
}

function TrendChart({
  points,
  metric,
}: {
  points: ProgressPoint[];
  metric: "load" | "estimated1Rm" | "volume";
}) {
  const values = points
    .map((point) => point[metric])
    .filter((value): value is number => value !== null);
  if (!values.length)
    return (
      <p className={styles.emptySmall}>
        Ajoutez une charge et des répétitions pour visualiser ce repère.
      </p>
    );
  if (values.length === 1)
    return (
      <p className={styles.emptySmall}>
        Une séance est enregistrée. La courbe apparaîtra dès la prochaine séance de cet exercice.
      </p>
    );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.max(max * 0.1, 1);
  const pointsForLine = points
    .map((point, index) => {
      const value = point[metric];
      if (value === null) return null;
      const x = 16 + (index / (points.length - 1)) * 268;
      const y = 120 - ((value - min) / spread) * 84;
      return { x, y, value, date: point.date };
    })
    .filter(
      (point): point is { x: number; y: number; value: number; date: string } => point !== null,
    );
  const path = pointsForLine
    .map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`)
    .join(" ");
  const label =
    metric === "volume"
      ? "Volume chargé par séance"
      : metric === "load"
        ? "Charge maximale"
        : "1RM estimé";
  return (
    <figure className={styles.trendChart} aria-label={`${label} au fil des séances`}>
      <svg
        viewBox="0 0 300 145"
        role="img"
        aria-label={`${label} : de ${formatStatNumber(values[0]!)} à ${formatStatNumber(values.at(-1)!)}${metric === "volume" ? " kg" : " kg"}`}
      >
        <line x1="16" y1="120" x2="284" y2="120" className={styles.chartGuide} />
        <line x1="16" y1="78" x2="284" y2="78" className={styles.chartGuide} />
        <path d={path} className={styles.chartLine} />
        {pointsForLine.map((point) => (
          <circle
            key={`${point.date}-${point.value}`}
            cx={point.x}
            cy={point.y}
            r="4"
            className={styles.chartPoint}
          />
        ))}
      </svg>
      <figcaption>
        <span>{shortDate(pointsForLine[0]!.date)}</span>
        <span>{shortDate(pointsForLine.at(-1)!.date)}</span>
      </figcaption>
    </figure>
  );
}

type AlbumPhoto = {
  src: string;
  sessionName: string;
  date: string;
};

function PhotoAlbum({ history, username }: { history: Session[]; username?: string }) {
  const [open, setOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const photos = useMemo<AlbumPhoto[]>(
    () =>
      history.flatMap((session) =>
        (session.feedback?.photos ?? []).map((src) => ({
          src,
          sessionName: session.name || "Séance",
          date: session.startedAt,
        })),
      ),
    [history],
  );
  const ownerLabel = username ? `@${username}` : "ce profil";

  useEffect(() => {
    if (viewerIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setViewerIndex(null);
      if (event.key === "ArrowLeft") {
        setViewerIndex((current) =>
          current === null ? null : (current - 1 + photos.length) % photos.length,
        );
      }
      if (event.key === "ArrowRight") {
        setViewerIndex((current) => (current === null ? null : (current + 1) % photos.length));
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [photos.length, viewerIndex]);

  return (
    <section className={styles.profileAlbum} aria-labelledby="profile-album-title">
      <div className={styles.profileAlbumHeading}>
        <div>
          <p className={styles.eyebrow}>Souvenirs de séances</p>
          <h2 id="profile-album-title">{username ? `Album de ${ownerLabel}` : "Votre album"}</h2>
        </div>
        <button
          type="button"
          className={styles.secondary}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Fermer l’album" : "Ouvrir l’album"}
          <span
            className={styles.albumCount}
            aria-label={`${photos.length} photo${photos.length > 1 ? "s" : ""}`}
          >
            {photos.length}
          </span>
        </button>
      </div>
      {open &&
        (photos.length ? (
          <div className={styles.albumGrid}>
            {photos.map((photo, index) => (
              <figure className={styles.albumItem} key={`${photo.src}-${index}`}>
                <button
                  type="button"
                  className={styles.albumPhotoButton}
                  aria-label={`Ouvrir la photo ${index + 1} de ${ownerLabel}`}
                  onClick={() => setViewerIndex(index)}
                >
                  <img
                    src={photo.src}
                    alt={`${photo.sessionName}, ${shortDate(photo.date)}`}
                    loading="lazy"
                  />
                </button>
                <figcaption>
                  <strong>{photo.sessionName}</strong>
                  <span>{shortDate(photo.date)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className={styles.emptySmall}>
            <strong>Aucune photo dans l’album</strong>
            <p>Les photos ajoutées aux séances de {ownerLabel} apparaîtront ici.</p>
          </div>
        ))}
      {viewerIndex !== null && photos[viewerIndex] && (
        <div
          className={styles.photoLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo de l’album de ${ownerLabel}`}
          onClick={() => setViewerIndex(null)}
        >
          <button
            type="button"
            className={styles.photoLightboxClose}
            aria-label="Fermer la photo"
            autoFocus
            onClick={() => setViewerIndex(null)}
          >
            ×
          </button>
          <div className={styles.photoLightboxContent} onClick={(event) => event.stopPropagation()}>
            {photos.length > 1 && (
              <button
                type="button"
                className={styles.photoLightboxNav}
                aria-label="Photo précédente"
                onClick={() =>
                  setViewerIndex((current) =>
                    current === null ? null : (current - 1 + photos.length) % photos.length,
                  )
                }
              >
                ‹
              </button>
            )}
            <img
              className={styles.photoLightboxImage}
              src={photos[viewerIndex].src}
              alt={`${photos[viewerIndex].sessionName}, ${shortDate(photos[viewerIndex].date)}`}
            />
            {photos.length > 1 && (
              <button
                type="button"
                className={styles.photoLightboxNav}
                aria-label="Photo suivante"
                onClick={() =>
                  setViewerIndex((current) =>
                    current === null ? null : (current + 1) % photos.length,
                  )
                }
              >
                ›
              </button>
            )}
          </div>
          <p className={styles.photoLightboxCounter}>
            {viewerIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </section>
  );
}

export function StatsDashboard({
  history,
  username,
  compact = false,
}: {
  history: Session[];
  username?: string;
  compact?: boolean;
}) {
  const [range, setRange] = useState<StatsRange>("all");
  const [rhythmUnit, setRhythmUnit] = useState<RhythmUnit>("week");
  const stats = useMemo(() => getSportStats(history, range), [history, range]);
  const exerciseProgressions = useMemo(() => getExerciseProgressions(history), [history]);
  const rhythmBuckets = useMemo(
    () => getRhythmBuckets(stats.sessions, rhythmUnit),
    [stats.sessions, rhythmUnit],
  );
  const [selectedExercise, setSelectedExercise] = useState("");
  const [progressMetric, setProgressMetric] = useState<"load" | "estimated1Rm" | "volume">("load");
  const progressExercise =
    stats.topExercises.find((exercise) => exercise.exerciseId === selectedExercise) ??
    stats.topExercises[0];
  const progress = useMemo(
    () => (progressExercise ? getExerciseProgress(history, progressExercise.exerciseId) : []),
    [history, progressExercise],
  );
  const firstLoad = progress[0]?.load ?? 0;
  const latestLoad = progress.at(-1)?.load ?? 0;
  const firstOneRm = progress.find((point) => point.estimated1Rm !== null)?.estimated1Rm ?? null;
  const latestOneRm =
    [...progress].reverse().find((point) => point.estimated1Rm !== null)?.estimated1Rm ?? null;
  const hasOneRm = progress.some((point) => point.estimated1Rm !== null);

  if (!history.length)
    return (
      <section className={styles.profile} aria-labelledby="profile-title">
        {!compact && (
          <div className={styles.pageHeading}>
            <p className={styles.eyebrow}>Votre espace Sport</p>
            <h1 id="profile-title">{username ? `Profil de ${username}` : "Mon profil"}</h1>
          </div>
        )}
        <PhotoAlbum history={history} username={username} />
        <div className={styles.empty}>
          <h2>Votre profil se construit ici</h2>
          <p>Terminez une première séance pour voir votre rythme, vos exercices et vos progrès.</p>
        </div>
      </section>
    );

  return (
    <section className={`${styles.stats} ${styles.profile}`} aria-labelledby="profile-title">
      {!compact && (
        <div className={styles.pageHeading}>
          <p className={styles.eyebrow}>Votre espace Sport</p>
          <h1 id="profile-title">{username ? `Profil de ${username}` : "Mon profil"}</h1>
        </div>
      )}
      <PhotoAlbum history={history} username={username} />
      <div className={styles.segment} aria-label="Période des statistiques">
        {(Object.keys(rangeLabels) as StatsRange[]).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={range === item}
            onClick={() => setRange(item)}
          >
            {rangeLabels[item]}
          </button>
        ))}
      </div>
      {!stats.sessions.length ? (
        <div className={styles.emptySmall}>
          Aucune séance enregistrée sur cette période. Choisissez une période plus large.
        </div>
      ) : (
        <>
          <section className={styles.statGrid} aria-label="Synthèse de la période">
            <div className={styles.statCard}>
              <span>Séances</span>
              <strong>{stats.sessions.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Exercices</span>
              <strong>{stats.exerciseCount}</strong>
            </div>
          </section>

          {exerciseProgressions.length > 0 && (
            <section className={styles.statsPanel} aria-labelledby="exercise-levels-title">
              <div className={styles.statsHeading}>
                <div>
                  <p className={styles.eyebrow}>Votre pratique</p>
                  <h2 id="exercise-levels-title">Niveaux d’exercices</h2>
                </div>
                <span className={styles.badge}>
                  {exerciseProgressions.length} pratiqué{exerciseProgressions.length > 1 ? "s" : ""}
                </span>
              </div>
              <ul className={styles.progressionList}>
                {exerciseProgressions.slice(0, 8).map((exercise) => (
                  <li key={exercise.exerciseId}>
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>
                        {exercise.practiceCount} séance{exercise.practiceCount > 1 ? "s" : ""}
                      </small>
                    </span>
                    <ProgressionBadge kind="exercise" level={exercise.level} compact />
                  </li>
                ))}
              </ul>
              {exerciseProgressions.length > 8 && (
                <p className={styles.statsNote}>
                  Les autres niveaux apparaissent au fil de votre pratique.
                </p>
              )}
              {stats.muscles.length > 0 && (
                <div className={styles.muscleSection}>
                  <h3>Répartition musculaire</h3>
                  <p>Les muscles principaux comptent pour 1 série, les secondaires pour 0,5.</p>
                  <MuscleDistribution muscles={stats.muscles} />
                </div>
              )}
            </section>
          )}

          <section className={styles.statsPanel} aria-labelledby="rhythm-title">
            <div className={styles.statsHeading}>
              <div>
                <p className={styles.eyebrow}>Régularité</p>
                <h2 id="rhythm-title">Votre rythme</h2>
              </div>
              <span className={styles.badge}>
                {stats.sessions.length} séance{stats.sessions.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className={styles.segment} aria-label="Granularité du rythme">
              <button
                type="button"
                aria-pressed={rhythmUnit === "day"}
                onClick={() => setRhythmUnit("day")}
              >
                Jours
              </button>
              <button
                type="button"
                aria-pressed={rhythmUnit === "week"}
                onClick={() => setRhythmUnit("week")}
              >
                Semaines
              </button>
              <button
                type="button"
                aria-pressed={rhythmUnit === "month"}
                onClick={() => setRhythmUnit("month")}
              >
                Mois
              </button>
            </div>
            <MiniBars values={rhythmBuckets} unit={rhythmUnit} />
            <div className={styles.splitRows}>
              {stats.sessionsByKind.map(({ kind, count }) => (
                <span key={kind}>
                  {sessionLabels[kind]} <strong>{count}</strong>
                </span>
              ))}
            </div>
          </section>

          {progressExercise && (
            <section className={styles.statsPanel} aria-labelledby="progress-title">
              <div className={styles.statsHeading}>
                <div>
                  <p className={styles.eyebrow}>Depuis la première séance</p>
                  <h2 id="progress-title">Progression par exercice</h2>
                </div>
              </div>
              <label className={styles.field}>
                Exercice suivi
                <select
                  value={progressExercise.exerciseId}
                  onChange={(event) => setSelectedExercise(event.target.value)}
                >
                  {stats.topExercises.map((exercise) => (
                    <option key={exercise.exerciseId} value={exercise.exerciseId}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.progressSummary}>
                <div>
                  <span>Charge max</span>
                  <strong>{formatStatNumber(latestLoad)} kg</strong>
                  <small>
                    {formatSignedPercent(percentageChange(firstLoad, latestLoad))} depuis le départ
                  </small>
                </div>
                <div>
                  <span>Meilleur 1RM estimé</span>
                  <strong>
                    {latestOneRm === null ? "—" : `${formatStatNumber(latestOneRm, 1)} kg`}
                  </strong>
                  <small>
                    {hasOneRm
                      ? `${formatSignedPercent(firstOneRm === null || latestOneRm === null ? null : percentageChange(firstOneRm, latestOneRm))} depuis le départ`
                      : "Répétitions requises"}
                  </small>
                </div>
              </div>
              <div className={styles.segment} aria-label="Mesure de progression">
                <button
                  type="button"
                  aria-pressed={progressMetric === "load"}
                  onClick={() => setProgressMetric("load")}
                >
                  Charge
                </button>
                <button
                  type="button"
                  aria-pressed={progressMetric === "volume"}
                  onClick={() => setProgressMetric("volume")}
                >
                  Volume
                </button>
                <button
                  type="button"
                  disabled={!hasOneRm}
                  aria-pressed={progressMetric === "estimated1Rm"}
                  onClick={() => setProgressMetric("estimated1Rm")}
                >
                  1RM estimé
                </button>
              </div>
              <TrendChart points={progress} metric={progressMetric} />
              <p className={styles.statsNote}>
                Le 1RM estimé utilise la formule d’Epley (charge × (1 + répétitions / 30)). C’est un
                repère de progression, pas un test maximal.
              </p>
            </section>
          )}
        </>
      )}
    </section>
  );
}
