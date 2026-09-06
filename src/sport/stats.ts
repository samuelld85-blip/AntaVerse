import { exercises, muscleLabels, sessionLabels, type Muscle } from "./catalog";
import type { Session } from "./model";

export type StatsRange = "30d" | "90d" | "all";

export type ExerciseTrend = {
  exerciseId: string;
  name: string;
  sessions: number;
  sets: number;
  volume: number;
  bestLoad: number;
  bestEstimated1Rm: number | null;
  equipment: Set<string>;
};

export type ProgressPoint = {
  date: string;
  load: number;
  volume: number;
  estimated1Rm: number | null;
};

export type SportStats = {
  sessions: Session[];
  setCount: number;
  volume: number;
  exerciseCount: number;
  sessionsByKind: { kind: Session["kind"]; count: number }[];
  weeklySessions: { label: string; count: number }[];
  topExercises: ExerciseTrend[];
  muscles: { muscle: Muscle; sets: number }[];
};

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
}

function inRange(session: Session, range: StatsRange, now: Date) {
  if (range === "all") return true;
  const days = range === "30d" ? 30 : 90;
  const cutoff = startOfDay(now).getTime() - (days - 1) * dayMs;
  return new Date(session.startedAt).getTime() >= cutoff;
}

export function estimated1Rm(loadKg: number, reps: number | null) {
  if (!loadKg || !reps || reps > 30) return null;
  return loadKg * (1 + reps / 30);
}

export function percentageChange(first: number, last: number) {
  if (!first) return null;
  return ((last - first) / first) * 100;
}

export function formatStatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits }).format(value);
}

export function formatVolume(volume: number) {
  if (volume >= 1000) return `${formatStatNumber(volume / 1000, 1)} t`;
  return `${formatStatNumber(volume)} kg`;
}

export function getSportStats(
  history: Session[],
  range: StatsRange,
  now = new Date(),
): SportStats {
  const sessions = history
    .filter((session) => inRange(session, range, now))
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  const exerciseMap = new Map<string, ExerciseTrend>();
  const muscleMap = new Map<Muscle, number>();
  const kindMap = new Map<Session["kind"], number>();
  let setCount = 0;
  let volume = 0;

  for (const session of sessions) {
    kindMap.set(session.kind, (kindMap.get(session.kind) ?? 0) + 1);
    for (const entry of session.exercises) {
      const exercise = exercises.find((item) => item.id === entry.config.exerciseId);
      if (!exercise || !entry.completedSets.length) continue;
      const existing = exerciseMap.get(exercise.id) ?? {
        exerciseId: exercise.id,
        name: exercise.name,
        sessions: 0,
        sets: 0,
        volume: 0,
        bestLoad: 0,
        bestEstimated1Rm: null,
        equipment: new Set<string>(),
      };
      existing.sessions += 1;
      for (const set of entry.completedSets) {
        setCount += 1;
        existing.sets += 1;
        existing.bestLoad = Math.max(existing.bestLoad, set.loadKg);
        existing.equipment.add(set.equipment);
        const setVolume = set.reps ? set.loadKg * set.reps : 0;
        volume += setVolume;
        existing.volume += setVolume;
        const oneRm = estimated1Rm(set.loadKg, set.reps);
        if (oneRm !== null)
          existing.bestEstimated1Rm = Math.max(existing.bestEstimated1Rm ?? 0, oneRm);
        muscleMap.set(exercise.primary, (muscleMap.get(exercise.primary) ?? 0) + 1);
        for (const muscle of exercise.secondary)
          muscleMap.set(muscle, (muscleMap.get(muscle) ?? 0) + 0.5);
      }
      exerciseMap.set(exercise.id, existing);
    }
  }

  const currentWeek = startOfWeek(now);
  const weeklySessions = Array.from({ length: 6 }, (_, index) => {
    const week = new Date(currentWeek);
    week.setDate(week.getDate() - (5 - index) * 7);
    const nextWeek = new Date(week);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return {
      label: new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(week),
      count: sessions.filter((session) => {
        const date = new Date(session.startedAt);
        return date >= week && date < nextWeek;
      }).length,
    };
  });

  return {
    sessions,
    setCount,
    volume,
    exerciseCount: exerciseMap.size,
    sessionsByKind: Array.from(kindMap, ([kind, count]) => ({ kind, count })).sort(
      (a, b) => b.count - a.count || sessionLabels[a.kind].localeCompare(sessionLabels[b.kind], "fr"),
    ),
    weeklySessions,
    topExercises: Array.from(exerciseMap.values()).sort(
      (a, b) => b.sessions - a.sessions || b.sets - a.sets || a.name.localeCompare(b.name, "fr"),
    ),
    muscles: Array.from(muscleMap, ([muscle, sets]) => ({ muscle, sets })).sort(
      (a, b) => b.sets - a.sets || muscleLabels[a.muscle].localeCompare(muscleLabels[b.muscle], "fr"),
    ),
  };
}

export function getExerciseProgress(history: Session[], exerciseId: string): ProgressPoint[] {
  return history
    .map((session) => {
      const entries = session.exercises.filter((entry) => entry.config.exerciseId === exerciseId);
      if (!entries.length) return null;
      const sets = entries.flatMap((entry) => entry.completedSets);
      if (!sets.length) return null;
      const estimated = sets
        .map((set) => estimated1Rm(set.loadKg, set.reps))
        .filter((value): value is number => value !== null);
      return {
        date: session.startedAt,
        load: Math.max(...sets.map((set) => set.loadKg)),
        volume: sets.reduce((sum, set) => sum + (set.reps ? set.loadKg * set.reps : 0), 0),
        estimated1Rm: estimated.length ? Math.max(...estimated) : null,
      };
    })
    .filter((point): point is ProgressPoint => point !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
