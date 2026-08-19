// Shared convention for every individual game's player-setup screen (Purple,
// Triman, Roulette du Chaos, Palmier, ...): a game may pre-fill more fields
// than its minimum requires (e.g. 3 shown, 2 minimum) — anything at or past
// the minimum's index is removable immediately, including on first render,
// while the first `minPlayers` entries never are. Removability is derived
// from the field's current position, not from the total count, so it stays
// correct as players are added or removed anywhere in the list.
export interface PlayerField {
  id: number;
  value: string;
}

export function createDefaultFields(count: number): PlayerField[] {
  return Array.from({ length: count }, (_, index) => ({ id: index, value: "" }));
}

export function isFieldRemovable(index: number, totalCount: number, minPlayers: number): boolean {
  return totalCount > minPlayers && index >= minPlayers;
}

export function addField(fields: PlayerField[], nextId: number, maxPlayers: number): PlayerField[] {
  if (fields.length >= maxPlayers) return fields;
  return [...fields, { id: nextId, value: "" }];
}

export function removeField(fields: PlayerField[], id: number, minPlayers: number): PlayerField[] {
  if (fields.length <= minPlayers) return fields;
  return fields.filter((field) => field.id !== id);
}

export function updateFieldValue(fields: PlayerField[], id: number, value: string): PlayerField[] {
  return fields.map((field) => (field.id === id ? { ...field, value } : field));
}

export function hasEmptyName(fields: PlayerField[]): boolean {
  return fields.some((field) => field.value.trim().length === 0);
}
