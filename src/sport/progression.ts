import { exercises } from "./catalog";
import { setExerciseId, type Session } from "./model";

export const XP_PER_SESSION = 100;

export type StatusDefinition = {
  key: string;
  label: string;
  threshold: number;
  icon: string;
};

export const GLOBAL_STATUSES: StatusDefinition[] = [
  { key: "rookie", label: "Rookie", threshold: 0, icon: "✦" },
  { key: "explorer", label: "Explorateur", threshold: 1, icon: "◈" },
  { key: "launched", label: "Lancé", threshold: 3, icon: "➜" },
  { key: "regular", label: "Régulier", threshold: 5, icon: "↗" },
  { key: "assiduous", label: "Assidu", threshold: 10, icon: "◆" },
  { key: "engaged", label: "Engagé", threshold: 15, icon: "✹" },
  { key: "solid", label: "Solide", threshold: 25, icon: "⬢" },
  { key: "pillar", label: "Pilier", threshold: 40, icon: "⬟" },
  { key: "reference", label: "Référence", threshold: 60, icon: "✧" },
  { key: "veteran", label: "Vétéran", threshold: 90, icon: "♜" },
  { key: "war-machine", label: "Machine de guerre", threshold: 130, icon: "⚡" },
];

export const EXERCISE_LEVEL_THRESHOLDS = [0, 1, 3, 6, 10, 15, 25, 40, 60];

export type ProgressionStep = {
  current: number;
  target: number | null;
  progress: number;
};

export type GlobalProgression = ProgressionStep & {
  sessions: number;
  xp: number;
  status: StatusDefinition;
  nextStatus: StatusDefinition | null;
};

export type ExerciseProgression = ProgressionStep & {
  exerciseId: string;
  name: string;
  practiceCount: number;
  level: number;
};

export function isQualifiedSession(session: Session) {
  return Boolean(session.endedAt && session.exercises.some((entry) => entry.completedSets.length > 0));
}

export function qualifiedSessions(history: Session[]) {
  return history.filter(isQualifiedSession);
}

function stepProgress(current: number, threshold: number, nextThreshold: number | null): ProgressionStep {
  if (nextThreshold === null) return { current, target: null, progress: 100 };
  const span = Math.max(1, nextThreshold - threshold);
  return {
    current,
    target: nextThreshold,
    progress: Math.min(100, Math.max(0, ((current - threshold) / span) * 100)),
  };
}

export function statusForSessions(sessions: number) {
  let current = GLOBAL_STATUSES[0]!;
  for (const status of GLOBAL_STATUSES) {
    if (status.threshold <= sessions) current = status;
    else break;
  }
  return current;
}

export function getGlobalProgression(history: Session[]): GlobalProgression {
  const sessions = qualifiedSessions(history).length;
  let statusIndex = 0;
  for (let index = 0; index < GLOBAL_STATUSES.length; index += 1) {
    if (GLOBAL_STATUSES[index]!.threshold <= sessions) statusIndex = index;
    else break;
  }
  const currentIndex = Math.max(0, statusIndex);
  const status = GLOBAL_STATUSES[currentIndex]!;
  const nextStatus = GLOBAL_STATUSES[currentIndex + 1] ?? null;
  return {
    ...stepProgress(sessions, status.threshold, nextStatus?.threshold ?? null),
    sessions,
    xp: sessions * XP_PER_SESSION,
    status,
    nextStatus,
  };
}

export function exerciseIdsInSession(session: Session) {
  if (!isQualifiedSession(session)) return [];
  return [...new Set(session.exercises.flatMap((entry) =>
    entry.completedSets.map((set) => setExerciseId(entry, set)),
  ))];
}

export function getExercisePracticeCounts(history: Session[]) {
  const counts = new Map<string, number>();
  for (const session of qualifiedSessions(history)) {
    for (const exerciseId of exerciseIdsInSession(session)) {
      counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1);
    }
  }
  return counts;
}

export function exerciseLevelForCount(practiceCount: number) {
  let level = 0;
  for (let index = 0; index < EXERCISE_LEVEL_THRESHOLDS.length; index += 1) {
    if (EXERCISE_LEVEL_THRESHOLDS[index]! <= practiceCount) level = index;
    else break;
  }
  return level;
}

export function getExerciseProgressions(history: Session[]): ExerciseProgression[] {
  const counts = getExercisePracticeCounts(history);
  return exercises
    .map((exercise) => {
      const practiceCount = counts.get(exercise.id) ?? 0;
      const level = exerciseLevelForCount(practiceCount);
      const nextThreshold = EXERCISE_LEVEL_THRESHOLDS[level + 1] ?? null;
      return {
        ...stepProgress(practiceCount, EXERCISE_LEVEL_THRESHOLDS[level]!, nextThreshold),
        exerciseId: exercise.id,
        name: exercise.name,
        practiceCount,
        level,
      };
    })
    .filter((progression) => progression.practiceCount > 0)
    .sort((a, b) => b.practiceCount - a.practiceCount || a.name.localeCompare(b.name, "fr"));
}

export function getExerciseProgression(history: Session[], exerciseId: string) {
  return getExerciseProgressions(history).find((progression) => progression.exerciseId === exerciseId) ?? {
    ...stepProgress(0, EXERCISE_LEVEL_THRESHOLDS[0]!, EXERCISE_LEVEL_THRESHOLDS[1]!),
    exerciseId,
    name: exercises.find((exercise) => exercise.id === exerciseId)?.name ?? exerciseId,
    practiceCount: 0,
    level: 0,
  };
}
