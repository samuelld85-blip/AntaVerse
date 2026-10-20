import type { AssistantContext } from "../../../supabase/functions/_shared/sport-ai-contract";
import { setExerciseId, type Session } from "../model";
import { getSessionVolume } from "../stats";

/** Explicit projection: never serialize the carnet, feedback, photos or social data. */
export function buildAssistantContext(
  history: Session[],
  focusSessionId: string | null = null,
  now = new Date(),
): AssistantContext {
  const completed = history.filter(
    (session) => session.endedAt && session.exercises.some((entry) => entry.completedSets.length),
  );
  const end = now.getTime();
  const date = (session: Session) => Date.parse(session.startedAt);
  const summarize = (sessions: Session[]) => ({
    sessions: sessions.length,
    sets: sessions.reduce(
      (sum, session) =>
        sum + session.exercises.reduce((count, entry) => count + entry.completedSets.length, 0),
      0,
    ),
    volumeKg: sessions.reduce((sum, session) => sum + getSessionVolume(session), 0),
  });
  const recent = completed
    .filter((session) => date(session) <= end)
    .sort((a, b) => date(b) - date(a));
  const focus = recent.find((session) => session.id === focusSessionId);
  return {
    generatedAt: now.toISOString(),
    summary: summarize(recent),
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
        ),
    })),
  };
}
