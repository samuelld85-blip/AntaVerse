// RÈGLE — a temporary rule applies to the whole group. V1 supports at most
// one active rule at a time (a new one replaces the previous — see engine.ts
// completeTurn/activateRule). See spec section 25 (R1-R12).

import { FORBIDDEN_WORDS } from "../content/forbidden-words";
import { VOICE_STYLES } from "../content/voice-styles";
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
    "Jusqu'à ton prochain tour, les mots « oui » et « non » sont interdits.",
    "Mots interdits : « oui » et « non ». Une gorgée par infraction.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r3",
    "Interdit de montrer",
    "Jusqu'à ton prochain tour, pointer quelqu'un du doigt est interdit. Chaque infraction coûte 1 gorgée.",
    "Interdiction de pointer quelqu'un du doigt. Chaque infraction coûte 1 gorgée.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r4",
    "Monsieur / Madame",
    "Jusqu'à ton prochain tour, on s'adresse aux autres en disant « Monsieur » ou « Madame » + prénom.",
    "S'adresser aux autres par « Monsieur »/« Madame » + prénom. Une gorgée par infraction.",
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
    "Téléphone interdit",
    "Jusqu'à ton prochain tour, personne ne touche à son téléphone personnel. La première infraction coûte 1 gorgée.",
    "Personne ne touche à son téléphone personnel. La première infraction coûte 1 gorgée, puis la règle se termine.",
    "firstViolation",
  ),
  {
    id: "r9",
    category: "REGLE",
    title: "Voix imposée",
    prompt:
      "L'application tire une manière de parler simple (chuchoter, voix de robot, présentateur TV...). Jusqu'à ton prochain tour, la première personne qui oublie boit 1.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "style")) return needRandom("style");
      const style = VOICE_STYLES[pickIndexFromSlot(input.randomSlots.style!, VOICE_STYLES.length)]!;
      const description = `Tout le monde doit ${style}. La première personne qui oublie boit 1 gorgée, puis la règle se termine.`;
      return done(
        outcome("Voix imposée", [description], "rule"),
        makeRule("r9", "Voix imposée", description, input.activePlayerId, "firstViolation"),
      );
    },
  },
  ruleEvent(
    "r10",
    "Pouce discret",
    "Avant ton prochain tour, pose discrètement ton pouce sur la table quand tu veux. Tous doivent t'imiter : le dernier boit 2. La règle se termine aussitôt.",
    "Quand le propriétaire de la règle pose discrètement son pouce sur la table, tous doivent l'imiter. Le dernier boit 2 gorgées, puis la règle se termine.",
    "firstViolation",
  ),
  ruleEvent(
    "r11",
    "Pas de « je »",
    "Jusqu'à ton prochain tour, « je » et « j' » sont interdits. Chaque infraction coûte 1 gorgée.",
    "Mots interdits : « je » et « j' ». Chaque infraction coûte 1 gorgée.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r12",
    "Signal secret",
    "Avant ton prochain tour, touche discrètement ton nez ou ton oreille. Tous doivent reproduire le geste : le dernier boit 2. La règle se termine aussitôt.",
    "Quand le propriétaire de la règle touche discrètement son nez ou son oreille, tous doivent reproduire le geste. Le dernier boit 2 gorgées, puis la règle se termine.",
    "firstViolation",
  ),
];
