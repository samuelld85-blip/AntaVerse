// Tap Battle — both players tap as fast as possible for a fixed window;
// highest count wins (tie → sudden-death replay, handled by the caller).

export const TAP_BATTLE_DURATION_MS = 5_000;

export function resolveTapBattle(countA: number, countB: number): "a" | "b" | "tie" {
  if (countA === countB) return "tie";
  return countA > countB ? "a" : "b";
}
