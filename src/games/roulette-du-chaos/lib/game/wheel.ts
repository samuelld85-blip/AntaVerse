// The wheel's 8 categories and the weighted random selection used to spin
// it. Kept as a clean data/config layer per the spec: probabilities never
// live inside a UI component.

import type { CategoryDefinition, CategoryId, EventDefinition } from "./types";

export const CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: "DISTRIBUE",
    label: "Distribue",
    weight: 18,
    icon: "🎁",
    description: "Tu distribues des gorgées autour de toi.",
  },
  {
    id: "SUBIS",
    label: "Subis",
    weight: 16,
    icon: "💀",
    description: "Tu subis les conséquences.",
  },
  {
    id: "DUEL",
    label: "Duel",
    weight: 16,
    icon: "⚔️",
    description: "Affronte un autre joueur dans un mini-jeu.",
  },
  {
    id: "TOUS",
    label: "Tous",
    weight: 14,
    icon: "👥",
    description: "Tout le monde participe.",
  },
  {
    id: "CHOISIS",
    label: "Choisis",
    weight: 13,
    icon: "🎲",
    description: "Risque ou sécurité, à toi de choisir.",
  },
  {
    id: "DESTIN",
    label: "Destin",
    weight: 11,
    icon: "🔮",
    description: "L'application décide pour toi.",
  },
  {
    id: "REGLE",
    label: "Règle",
    weight: 8,
    icon: "📜",
    description: "Une règle temporaire s'applique au groupe.",
  },
  {
    id: "JACKPOT",
    label: "Jackpot",
    weight: 4,
    icon: "👑",
    description: "Rare et spectaculaire.",
  },
] as const;

const TOTAL_WEIGHT = CATEGORIES.reduce((sum, category) => sum + category.weight, 0);

export function getCategory(id: CategoryId): CategoryDefinition {
  const category = CATEGORIES.find((entry) => entry.id === id);
  if (!category) throw new Error(`Catégorie inconnue : ${id}`);
  return category;
}

/** Weighted category pick from a single 0..1 slot value — pure and deterministic given that value. */
export function pickWeightedCategory(slotValue: number): CategoryId {
  let roll = slotValue * TOTAL_WEIGHT;
  for (const category of CATEGORIES) {
    if (roll < category.weight) return category.id;
    roll -= category.weight;
  }
  return CATEGORIES[CATEGORIES.length - 1]!.id;
}

/**
 * Picks one event from `events` using a slot value, avoiding the exact same
 * event as the most recent one or two draws when the category has enough
 * other options — a lightweight anti-repetition mechanism, not a fairness
 * engine (see spec: "do not build a complex fairness engine").
 */
export function pickEvent(
  events: readonly EventDefinition[],
  recentEventIds: readonly string[],
  slotValue: number,
): EventDefinition {
  const avoided = new Set(recentEventIds.slice(-2));
  const candidates = events.filter((event) => !avoided.has(event.id));
  const pool = candidates.length > 0 ? candidates : events;
  const index = Math.min(pool.length - 1, Math.floor(slotValue * pool.length));
  return pool[index]!;
}

export const RECENT_EVENT_HISTORY_SIZE = 6;
