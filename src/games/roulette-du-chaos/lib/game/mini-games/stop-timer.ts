// Stop Timer — stop a hidden timer as close as possible to 5.00s. Used both
// as a DUEL mini-game (closest wins) and as the canonical solo mini-game
// (stop within a tolerance window to succeed) — see spec sections 15 & 23.

export const STOP_TIMER_TARGET_MS = 5_000;
export const STOP_TIMER_SOLO_TOLERANCE_MS = 300; // accepts 4.70s–5.30s

export function stopTimerDistanceMs(elapsedMs: number): number {
  return Math.abs(elapsedMs - STOP_TIMER_TARGET_MS);
}

export function resolveStopTimerDuel(elapsedAMs: number, elapsedBMs: number): "a" | "b" | "tie" {
  const distanceA = stopTimerDistanceMs(elapsedAMs);
  const distanceB = stopTimerDistanceMs(elapsedBMs);
  if (distanceA === distanceB) return "tie";
  return distanceA < distanceB ? "a" : "b";
}

export function resolveStopTimerSolo(
  elapsedMs: number,
  toleranceMs: number = STOP_TIMER_SOLO_TOLERANCE_MS,
): boolean {
  return stopTimerDistanceMs(elapsedMs) <= toleranceMs;
}
