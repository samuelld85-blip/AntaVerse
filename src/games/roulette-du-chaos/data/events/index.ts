import { choisisEvents } from "./choisis";
import { destinEvents } from "./destin";
import { distribueEvents } from "./distribue";
import { duelEvents } from "./duel";
import { jackpotEvents } from "./jackpot";
import { regleEvents } from "./regle";
import { subisEvents } from "./subis";
import { tousEvents } from "./tous";
import type { CategoryId, EventDefinition } from "../../lib/game/types";

export const EVENTS_BY_CATEGORY: Record<CategoryId, readonly EventDefinition[]> = {
  DISTRIBUE: distribueEvents,
  SUBIS: subisEvents,
  DUEL: duelEvents,
  TOUS: tousEvents,
  CHOISIS: choisisEvents,
  DESTIN: destinEvents,
  REGLE: regleEvents,
  JACKPOT: jackpotEvents,
};

export const ALL_EVENTS: readonly EventDefinition[] = Object.values(EVENTS_BY_CATEGORY).flat();

const EVENTS_BY_ID = new Map(ALL_EVENTS.map((event) => [event.id, event]));

export function getEvent(id: string): EventDefinition {
  const event = EVENTS_BY_ID.get(id);
  if (!event) throw new Error(`Événement inconnu : ${id}`);
  return event;
}
