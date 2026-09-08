"use client";

import { useMemo, useState } from "react";
import { muscleLabels, sessionLabels, type Muscle } from "./catalog";
import type { Session } from "./model";
import {
  formatStatNumber,
  formatVolume,
  getExerciseProgress,
  getSportStats,
  percentageChange,
  type ProgressPoint,
  type StatsRange,
} from "./stats";
import { getExerciseProgressions, getGlobalProgression } from "./progression";
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

function MiniBars({ values }: { values: { label: string; count: number }[] }) {
  const maximum = Math.max(1, ...values.map((value) => value.count));
  return (
    <div className={styles.miniBars} aria-label="Séances par semaine sur les six dernières semaines">
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
  const values = points.map((point) => point[metric]).filter((value): value is number => value !== null);
  if (!values.length)
    return <p className={styles.emptySmall}>Ajoutez une charge et des répétitions pour visualiser ce repère.</p>;
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
    .filter((point): point is { x: number; y: number; value: number; date: string } => point !== null);
  const path = pointsForLine.map((point, index) => `${index ? "L" : "M"}${point.x} ${point.y}`).join(" ");
  const label = metric === "volume" ? "Volume chargé par séance" : metric === "load" ? "Charge maximale" : "1RM estimé";
  return (
    <figure className={styles.trendChart} aria-label={`${label} au fil des séances`}>
      <svg viewBox="0 0 300 145" role="img" aria-label={`${label} : de ${formatStatNumber(values[0]!)} à ${formatStatNumber(values.at(-1)!)}${metric === "volume" ? " kg" : " kg"}`}>
        <line x1="16" y1="120" x2="284" y2="120" className={styles.chartGuide} />
        <line x1="16" y1="78" x2="284" y2="78" className={styles.chartGuide} />
        <path d={path} className={styles.chartLine} />
        {pointsForLine.map((point) => (
          <circle key={`${point.date}-${point.value}`} cx={point.x} cy={point.y} r="4" className={styles.chartPoint} />
        ))}
      </svg>
      <figcaption>
        <span>{shortDate(pointsForLine[0]!.date)}</span>
        <span>{shortDate(pointsForLine.at(-1)!.date)}</span>
      </figcaption>
    </figure>
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
  const stats = useMemo(() => getSportStats(history, range), [history, range]);
  const globalProgression = useMemo(() => getGlobalProgression(history), [history]);
  const exerciseProgressions = useMemo(() => getExerciseProgressions(history), [history]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [progressMetric, setProgressMetric] = useState<"load" | "estimated1Rm" | "volume">(
    "load",
  );
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
  const latestOneRm = [...progress].reverse().find((point) => point.estimated1Rm !== null)?.estimated1Rm ?? null;
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
        {!compact && <section className={styles.profileHero} aria-label="Progression globale">
          <div>
            <p className={styles.eyebrow}>Statut actuel</p>
            <ProgressionBadge kind="status" status={globalProgression.status} />
          </div>
          <strong className={styles.profileHeroCount}>0 séance</strong>
          <p className={styles.profileLead}>
            Votre première séance débloquera votre statut Explorateur et lancera votre progression.
          </p>
        </section>}
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
      {!compact && <section className={styles.profileHero} aria-label="Progression globale">
        <div className={styles.profileHeroTop}>
          <div>
            <p className={styles.eyebrow}>Statut actuel</p>
            <ProgressionBadge kind="status" status={globalProgression.status} />
          </div>
          <div className={styles.profileHeroMetric}>
            <strong>{globalProgression.sessions}</strong>
            <span>séance{globalProgression.sessions > 1 ? "s" : ""}</span>
          </div>
        </div>
        {globalProgression.nextStatus ? (
          <>
            <div className={styles.progressionLine}>
              <span>Progression vers {globalProgression.nextStatus.label}</span>
              <strong>{globalProgression.target} séances</strong>
            </div>
            <div className={styles.progressTrack} aria-label={`${globalProgression.progress}% vers ${globalProgression.nextStatus.label}`}>
              <span style={{ width: `${globalProgression.progress}%` }} />
            </div>
          </>
        ) : (
          <p className={styles.profileLead}>Vous avez atteint le sommet actuel. Machine de guerre.</p>
        )}
      </section>}
      <div className={styles.segment} aria-label="Période des statistiques">
        {(Object.keys(rangeLabels) as StatsRange[]).map((item) => (
          <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)}>
            {rangeLabels[item]}
          </button>
        ))}
      </div>
      {!stats.sessions.length ? (
        <div className={styles.emptySmall}>Aucune séance enregistrée sur cette période. Choisissez une période plus large.</div>
      ) : (
        <>
          <section className={styles.statGrid} aria-label="Synthèse de la période">
            <div className={styles.statCard}>
              <span>Séances</span>
              <strong>{stats.sessions.length}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Séries</span>
              <strong>{formatStatNumber(stats.setCount)}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Exercices</span>
              <strong>{stats.exerciseCount}</strong>
            </div>
            <div className={styles.statCard}>
              <span>Volume chargé</span>
              <strong>{stats.volume ? formatVolume(stats.volume) : "—"}</strong>
            </div>
          </section>
          <p className={styles.statsNote}>
            Le volume chargé additionne charge × répétitions renseignées ; les séries sans répétitions restent comptées, mais pas dans le volume.
          </p>

          {exerciseProgressions.length > 0 && (
            <section className={styles.statsPanel} aria-labelledby="exercise-levels-title">
              <div className={styles.statsHeading}>
                <div>
                  <p className={styles.eyebrow}>Votre pratique</p>
                  <h2 id="exercise-levels-title">Niveaux d’exercices</h2>
                </div>
                <span className={styles.badge}>{exerciseProgressions.length} pratiqué{exerciseProgressions.length > 1 ? "s" : ""}</span>
              </div>
              <ul className={styles.progressionList}>
                {exerciseProgressions.slice(0, 8).map((exercise) => (
                  <li key={exercise.exerciseId}>
                    <span>
                      <strong>{exercise.name}</strong>
                      <small>{exercise.practiceCount} séance{exercise.practiceCount > 1 ? "s" : ""}</small>
                    </span>
                    <ProgressionBadge kind="exercise" level={exercise.level} compact />
                  </li>
                ))}
              </ul>
              {exerciseProgressions.length > 8 && (
                <p className={styles.statsNote}>Les autres niveaux apparaissent au fil de votre pratique.</p>
              )}
            </section>
          )}

          <section className={styles.statsPanel} aria-labelledby="rhythm-title">
            <div className={styles.statsHeading}>
              <div>
                <p className={styles.eyebrow}>Régularité</p>
                <h2 id="rhythm-title">Votre rythme</h2>
              </div>
              <span className={styles.badge}>{stats.sessions.length} séance{stats.sessions.length > 1 ? "s" : ""}</span>
            </div>
            <MiniBars values={stats.weeklySessions} />
            <div className={styles.splitRows}>
              {stats.sessionsByKind.map(({ kind, count }) => (
                <span key={kind}>{sessionLabels[kind]} <strong>{count}</strong></span>
              ))}
            </div>
          </section>

          <section className={styles.statsPanel} aria-labelledby="exercises-title">
            <div className={styles.statsHeading}>
              <div>
                <p className={styles.eyebrow}>Habitudes</p>
                <h2 id="exercises-title">Exercices les plus pratiqués</h2>
              </div>
            </div>
            <ol className={styles.exerciseRankings}>
              {stats.topExercises.slice(0, 5).map((exercise, index) => (
                <li key={exercise.exerciseId}>
                  <span className={styles.rank}>{index + 1}</span>
                  <span><strong>{exercise.name}</strong><small>{exercise.sets} séries · {exercise.sessions} séance{exercise.sessions > 1 ? "s" : ""}</small></span>
                  <span className={styles.exerciseLoad}>{exercise.bestLoad ? `${formatStatNumber(exercise.bestLoad)} kg` : "PDC"}</span>
                </li>
              ))}
            </ol>
            {stats.muscles.length > 0 && (
              <div className={styles.muscleSection}>
                <h3>Répartition musculaire</h3>
                <p>Les muscles principaux comptent pour 1 série, les secondaires pour 0,5.</p>
                <MuscleDistribution muscles={stats.muscles} />
              </div>
            )}
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
                <select value={progressExercise.exerciseId} onChange={(event) => setSelectedExercise(event.target.value)}>
                  {stats.topExercises.map((exercise) => <option key={exercise.exerciseId} value={exercise.exerciseId}>{exercise.name}</option>)}
                </select>
              </label>
              <div className={styles.progressSummary}>
                <div><span>Charge max</span><strong>{formatStatNumber(latestLoad)} kg</strong><small>{formatSignedPercent(percentageChange(firstLoad, latestLoad))} depuis le départ</small></div>
                <div><span>Meilleur 1RM estimé</span><strong>{latestOneRm === null ? "—" : `${formatStatNumber(latestOneRm, 1)} kg`}</strong><small>{hasOneRm ? `${formatSignedPercent(firstOneRm === null || latestOneRm === null ? null : percentageChange(firstOneRm, latestOneRm))} depuis le départ` : "Répétitions requises"}</small></div>
              </div>
              <div className={styles.segment} aria-label="Mesure de progression">
                <button type="button" aria-pressed={progressMetric === "load"} onClick={() => setProgressMetric("load")}>Charge</button>
                <button type="button" aria-pressed={progressMetric === "volume"} onClick={() => setProgressMetric("volume")}>Volume</button>
                <button type="button" disabled={!hasOneRm} aria-pressed={progressMetric === "estimated1Rm"} onClick={() => setProgressMetric("estimated1Rm")}>1RM estimé</button>
              </div>
              <TrendChart points={progress} metric={progressMetric} />
              <p className={styles.statsNote}>
                Le 1RM estimé utilise la formule d’Epley (charge × (1 + répétitions / 30)). C’est un repère de progression, pas un test maximal.
              </p>
            </section>
          )}
        </>
      )}
    </section>
  );
}
