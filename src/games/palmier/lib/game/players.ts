// Circular player-order helpers, local to this game (see Roulette du Chaos's
// own copy of the same shapes — ARCHITECTURE.md keeps per-game rules engines
// independent rather than forcing a shared abstraction for callers that
// happen to look alike).

export function nextPlayerIndex(index: number, count: number): number {
  return (index + 1) % count;
}

export function previousPlayerIndex(index: number, count: number): number {
  return (index - 1 + count) % count;
}

/** Picks one player from `pool` using a 0..1 random slot value. */
export function pickBySlot<T>(pool: readonly T[], slotValue: number): T {
  const index = Math.min(pool.length - 1, Math.floor(slotValue * pool.length));
  return pool[index]!;
}

/**
 * Picks `count` distinct players from `pool` using one random slot value per
 * pick, removing each pick from the pool before the next draw so the result
 * never contains duplicates. Clamps `count` to the pool size.
 */
export function pickDistinctBySlots<T>(pool: readonly T[], slotValues: readonly number[]): T[] {
  const remaining = [...pool];
  const picked: T[] = [];
  for (const slotValue of slotValues) {
    if (remaining.length === 0) break;
    const index = Math.min(remaining.length - 1, Math.floor(slotValue * remaining.length));
    picked.push(remaining[index]!);
    remaining.splice(index, 1);
  }
  return picked;
}
