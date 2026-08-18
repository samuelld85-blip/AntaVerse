// Circular player-order helpers. Every "previous"/"next" resolution in the
// rule engine and the turn-progression logic goes through these two
// functions so index-0/last-index wraparound is only ever implemented once.

export function nextPlayerIndex(index: number, count: number): number {
  return (index + 1) % count;
}

export function previousPlayerIndex(index: number, count: number): number {
  return (index - 1 + count) % count;
}
