import type { AssistantContext } from "../../../supabase/functions/_shared/sport-ai-contract";
import { setExerciseId, type Session } from "../model";
import { getSessionVolume } from "../stats";

const dayMs = 86_400_000;

/** Explicit projection: never serialize the carnet, feedback, photos or social data. */
export function buildAssistantContext(
  history: Session[],
  rangeDays: 30 | 90 = 30,
  focusSessionId: string | null = null,
  now = new Date(),
): AssistantContext {
  const completed = history.filter(
    (session) => session.endedAt && session.exercises.some((entry) => entry.completedSets.length),
  );
  const end = now.getTime();
  const cutoff = end - rangeDays * dayMs;
  const previousCutoff = cutoff - rangeDays * dayMs;
  const date = (session: Session) => Date.parse(session.startedAt);
  const current = completed.filter((session) => date(session) >= cutoff && date(session) <= end);
  const previous = completed.filter(
    (session) => date(session) >= previousCutoff && date(session) < cutoff,
  );
  const summarize = (sessions: Session[]) => ({
    sessions: sessions.length,
    sets: sessions.reduce(
      (sum, session) =>
        sum + session.exercises.reduce((count, entry) => count + entry.completedSets.length, 0),
      0,
    ),
    volumeKg: sessions.reduce((sum, session) => sum + getSessionVolume(session), 0),
  });
  const focus = completed.find((session) => session.id === focusSessionId);
  const recent = completed
    .filter(
      (session) =>
        date(session) >= previousCutoff && date(session) <= end && session.id !== focus?.id,
    )
    .sort((a, b) => date(b) - date(a))
    .slice(0, focus ? 11 : 12);
  if (focus) recent.unshift(focus);
  return {
    generatedAt: now.toISOString(),
    rangeDays,
    summary: summarize(current),
    previousSummary: summarize(previous),
    focusSessionId: focus?.id ?? null,
    recentSessions: recent.map((session) => ({
      id: session.id,
      date: session.startedAt,
      kind: session.kind,
      volumeKg: getSessionVolume(session),
      sets: session.exercises
        .flatMap((entry) =>
          entry.completedSets.map((set) => ({
            exerciseId: setExerciseId(entry, set),
            equipment: set.equipment,
            loadKg: set.loadKg,
            reps: set.reps,
          })),
        )
        .slice(0, 80),
    })),
  };
}
