// RÈGLE — a temporary rule applies to the whole group. V1 supports at most
// one active rule at a time (a new one replaces the previous — see engine.ts
// completeTurn/activateRule). See spec section 25 (R1-R8).

import { FORBIDDEN_WORDS } from "../content/forbidden-words";
import {
  done,
  hasSlots,
  makeRule,
  needRandom,
  outcome,
  pickIndexFromSlot,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

function ruleEvent(
  id: string,
  title: string,
  prompt: string,
  description: string,
  expiry: "ownerNextTurn" | "firstViolation" | "timer",
  timerMs: number | null = null,
): EventDefinition {
  return {
    id,
    category: "REGLE",
    title,
    prompt,
    visualHint: "none",
    resolve(input) {
      const rule = makeRule(id, title, description, input.activePlayerId, expiry, timerMs);
      return done(outcome(title, [description], "rule"), rule);
    },
  };
}

export const regleEvents: EventDefinition[] = [
  ruleEvent(
    "r1",
    "Plus de prénom",
    "Jusqu'à ton prochain tour, personne ne peut dire le prénom d'un autre joueur.",
    "Interdiction de dire le prénom d'un autre joueur. Une gorgée par infraction.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r2",
    "Oui / Non",
    'Jusqu\'à ton prochain tour, les mots "oui" et "non" sont interdits.',
    'Mots interdits : "oui" et "non". Une gorgée par infraction.',
    "ownerNextTurn",
  ),
  ruleEvent(
    "r3",
    "Main faible",
    "Jusqu'à ton prochain tour, tout le monde boit avec sa main non dominante.",
    "Boire avec la main non dominante. Une gorgée par infraction.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r4",
    "Monsieur / Madame",
    'Jusqu\'à ton prochain tour, on s\'adresse aux autres en disant "Monsieur" ou "Madame" + prénom.',
    'S\'adresser aux autres par "Monsieur"/"Madame" + prénom. Une gorgée par infraction.',
    "ownerNextTurn",
  ),
  ruleEvent(
    "r5",
    "Pas de gros mot",
    "Jusqu'à ton prochain tour (ou la première infraction) : pas de gros mot.",
    "Premier gros mot entendu : 1 gorgée, puis la règle se termine.",
    "firstViolation",
  ),
  {
    id: "r6",
    category: "REGLE",
    title: "Mot interdit",
    prompt:
      "Un mot est tiré au sort. Le premier qui le prononce boit 1 gorgée, puis la règle se termine.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "word")) return needRandom("word");
      const word =
        FORBIDDEN_WORDS[pickIndexFromSlot(input.randomSlots.word!, FORBIDDEN_WORDS.length)]!;
      const description = `Mot interdit : "${word}". Le premier à le dire boit 1 gorgée, puis la règle se termine.`;
      const rule = makeRule(
        "r6",
        "Mot interdit",
        description,
        input.activePlayerId,
        "firstViolation",
      );
      return done(outcome("Mot interdit", [description], "rule"), rule);
    },
  },
  ruleEvent(
    "r7",
    "Question interdite",
    "Jusqu'à ton prochain tour : répondre directement à une question posée coûte 1 gorgée.",
    "Répondre directement à une question posée coûte 1 gorgée à celui qui répond.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r8",
    "Silence express",
    "Silence total pendant 30 secondes. Le premier à parler boit 2 gorgées.",
    "Silence total pendant 30 secondes. Le premier à parler boit 2 gorgées.",
    "timer",
    30_000,
  ),
];
