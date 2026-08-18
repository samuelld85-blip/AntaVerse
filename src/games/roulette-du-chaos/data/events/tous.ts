// TOUS — the whole group participates. See spec section 22 (T1-T8). Several
// of these are physically self-arbitrated (nobody can detect who pointed at
// whom, or who spoke first) — the app narrates the rule and, where the spec
// calls for it, lets the group tap in who was affected.

import { DESIGNATION_PROMPTS } from "../content/designation-prompts";
import { MAJORITY_PROMPTS } from "../content/majority-prompts";
import { pickBySlot } from "../../lib/game/players";
import {
  done,
  drinks,
  hasSlots,
  needChoice,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

const EXTREME_TRAITS: readonly string[] = [
  "le/la plus jeune",
  "le/la plus âgé(e)",
  "le/la plus grand(e)",
  "le/la plus petit(e)",
  "celui ou celle arrivé(e) le/la plus tard ce soir",
  "celui ou celle qui habite le plus loin d'ici",
  "celui ou celle qui s'est levé(e) le/la plus tôt aujourd'hui",
];

/** Shared "who was designated" step: single pick → 2 gorgées, tie (2+ picks) → 1 each. */
function resolveDesignation(
  input: Parameters<EventDefinition["resolve"]>[0],
  title: string,
  label: string,
) {
  const picked = input.targetRounds[0];
  if (!picked) {
    return needTargets(1, input.players.length, { excludeIds: [], label });
  }
  const amount = picked.length === 1 ? 2 : 1;
  const lines = picked.map((id) => drinks(playerName(input.players, id), amount));
  return done(outcome(title, lines));
}

export const tousEvents: EventDefinition[] = [
  {
    id: "t1",
    category: "TOUS",
    title: "Santé",
    prompt: "Tout le monde boit 1 gorgée.",
    visualHint: "none",
    resolve() {
      return done(outcome("Santé", ["Tout le monde boit 1 gorgée. Santé !"]));
    },
  },
  {
    id: "t2",
    category: "TOUS",
    title: "Majorité",
    prompt: "Le groupe vote à main levée entre deux options. La minorité boit.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
      const prompt = pickBySlot(MAJORITY_PROMPTS, input.randomSlots.prompt!);
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "left", label: prompt.left },
            { key: "right", label: prompt.right },
            { key: "tie", label: "Égalité" },
          ],
          `${prompt.left} ou ${prompt.right} ? Votez à main levée.`,
        );
      }
      if (input.choiceKey === "tie")
        return done(outcome("Majorité", ["Égalité : personne ne boit."]));
      const minorityLabel = input.choiceKey === "left" ? prompt.right : prompt.left;
      return done(outcome("Majorité", [`La minorité (${minorityLabel}) boit 1 gorgée.`]));
    },
  },
  {
    id: "t3",
    category: "TOUS",
    title: "Le dernier",
    prompt: "Au signal, le dernier à lever la main boit 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      const picked = input.targetRounds[0];
      if (!picked) {
        return needTargets(1, 1, { excludeIds: [], label: "Qui a levé la main en dernier ?" });
      }
      return done(outcome("Le dernier", [drinks(playerName(input.players, picked[0]!), 2)]));
    },
  },
  {
    id: "t4",
    category: "TOUS",
    title: "Le doigt",
    prompt: "3, 2, 1, pointez ! Le joueur le plus pointé du doigt boit.",
    visualHint: "none",
    resolve(input) {
      return resolveDesignation(input, "Le doigt", "Qui a été le plus pointé du doigt ?");
    },
  },
  {
    id: "t5",
    category: "TOUS",
    title: "Tout le monde sauf...",
    prompt: "L'application épargne un joueur au hasard. Tous les autres boivent 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "spared")) return needRandom("spared");
      const spared = pickBySlot(input.players, input.randomSlots.spared!);
      return done(
        outcome("Tout le monde sauf...", [`Tout le monde boit 1 gorgée, sauf ${spared.name}.`]),
      );
    },
  },
  {
    id: "t6",
    category: "TOUS",
    title: "Les extrêmes",
    prompt: "Une caractéristique neutre est tirée au sort. Le groupe s'accorde sur qui correspond.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "trait")) return needRandom("trait");
      const trait =
        EXTREME_TRAITS[pickIndexFromSlot(input.randomSlots.trait!, EXTREME_TRAITS.length)]!;
      return resolveDesignation(input, "Les extrêmes", `Qui est ${trait} ?`);
    },
  },
  {
    id: "t7",
    category: "TOUS",
    title: "Pair ou impair",
    prompt: "Tout le monde montre 1 à 5 doigts en même temps. L'application tire pair ou impair.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "parity")) return needRandom("parity");
      const parity = input.randomSlots.parity! < 0.5 ? "PAIR" : "IMPAIR";
      const adjective = parity === "PAIR" ? "pair" : "impair";
      return done(
        outcome("Pair ou impair", [
          `Résultat : ${parity} ! Les joueurs avec un nombre ${adjective} de doigts boivent 1 gorgée.`,
        ]),
      );
    },
  },
  {
    id: "t8",
    category: "TOUS",
    title: "Désignation",
    prompt: "Qui serait le plus susceptible de... ? Le groupe pointe un joueur.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
      const promptText =
        DESIGNATION_PROMPTS[
          pickIndexFromSlot(input.randomSlots.prompt!, DESIGNATION_PROMPTS.length)
        ]!;
      return resolveDesignation(
        input,
        "Désignation",
        `Qui serait le plus susceptible de ${promptText} ?`,
      );
    },
  },
];
