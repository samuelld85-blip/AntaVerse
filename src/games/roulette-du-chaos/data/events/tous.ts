// TOUS — the whole group participates. See spec section 22 (T1-T12). Several
// of these are physically self-arbitrated (nobody can detect who pointed at
// whom, or who spoke first) — the app narrates the rule and, where the spec
// calls for it, lets the group tap in who was affected.

import { CHAIN_CATEGORIES } from "../content/chain-categories";
import { DESIGNATION_PROMPTS } from "../content/designation-prompts";
import { ESTIMATION_QUESTIONS } from "../content/estimation-questions";
import { EXTREME_QUESTIONS } from "../content/extreme-questions";
import { MAJORITY_PROMPTS } from "../content/majority-prompts";
import { NEVER_HAVE_I_EVER } from "../content/never-have-i-ever";
import { SPICY_DESIGNATION_PROMPTS } from "../content/spicy-designation-prompts";
import { pickBySlot } from "../../lib/game/players";
import {
  done,
  hasSlots,
  needChoice,
  needRandom,
  outcome,
  pickIndexFromSlot,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

/**
 * T8 draws from both designation banks: the light fragments (rendered into
 * the "Qui serait le plus susceptible de ... ?" frame) and the spicier
 * ready-made questions.
 */
const DESIGNATION_POOL: readonly string[] = [
  ...DESIGNATION_PROMPTS.map((fragment) => `Qui serait le plus susceptible de ${fragment} ?`),
  ...SPICY_DESIGNATION_PROMPTS,
];

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
    resolve() {
      return done(outcome("Le dernier", ["Le dernier à lever la main boit 2 gorgées."]));
    },
  },
  {
    id: "t4",
    category: "TOUS",
    title: "Le doigt",
    prompt: "3, 2, 1, pointez ! Le joueur le plus pointé du doigt boit.",
    visualHint: "none",
    resolve() {
      return done(
        outcome("Le doigt", [
          "Le plus pointé du doigt boit 2 gorgées (ou 1 chacun en cas d'égalité).",
        ]),
      );
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
    prompt:
      "L'application tire une caractéristique volontairement personnelle, gênante ou provocante : sexe, relations, alcool, drogues, argent, boulot, habitudes de soirée, etc. Le groupe désigne la personne qui correspond le plus ; elle boit 2.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "trait")) return needRandom("trait");
      const question =
        EXTREME_QUESTIONS[pickIndexFromSlot(input.randomSlots.trait!, EXTREME_QUESTIONS.length)]!;
      return done(
        outcome("Les extrêmes", [
          question,
          "Le groupe désigne — la personne choisie boit 2 gorgées.",
        ]),
      );
    },
  },
  {
    id: "t7",
    category: "TOUS",
    title: "Nombre maudit",
    prompt:
      "Tout le monde montre simultanément entre 0 et 5 doigts. L'application tire ensuite un nombre de 0 à 5 : ceux qui ont exactement ce nombre boivent 2 ; si personne ne l'a, le ou les plus proches boivent 1.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "cursed")) return needRandom("cursed");
      const cursed = pickIndexFromSlot(input.randomSlots.cursed!, 6);
      return done(
        outcome("Nombre maudit", [
          `Nombre maudit : ${cursed}`,
          `Ceux qui montrent ${cursed} doigts boivent 2 gorgées.`,
          "Si personne ne l'a, le ou les plus proches boivent 1 gorgée.",
        ]),
      );
    },
  },
  {
    id: "t8",
    category: "TOUS",
    title: "Désignation",
    prompt:
      "L'application affiche « Qui serait le plus susceptible de... ? ». 3, 2, 1 : tout le monde pointe. Le plus désigné boit 2.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
      const question =
        DESIGNATION_POOL[pickIndexFromSlot(input.randomSlots.prompt!, DESIGNATION_POOL.length)]!;
      return done(
        outcome("Désignation", [question, "3, 2, 1 : pointez ! Le plus désigné boit 2 gorgées."]),
      );
    },
  },
  {
    id: "t9",
    category: "TOUS",
    title: "Je n'ai jamais express",
    prompt:
      "L'application affiche un « Je n'ai jamais... ». Tous ceux qui l'ont déjà fait boivent 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "statement")) return needRandom("statement");
      const statement =
        NEVER_HAVE_I_EVER[
          pickIndexFromSlot(input.randomSlots.statement!, NEVER_HAVE_I_EVER.length)
        ]!;
      return done(
        outcome("Je n'ai jamais express", [
          statement,
          "Tous ceux qui l'ont fait boivent 1 gorgée.",
        ]),
      );
    },
  },
  {
    id: "t10",
    category: "TOUS",
    title: "Tour de table",
    prompt:
      "L'application donne une catégorie. En tournant autour de la table, chacun doit donner une réponse différente en moins de 3 secondes. Le premier qui bloque, répète ou se trompe boit 2.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "category")) return needRandom("category");
      const category =
        CHAIN_CATEGORIES[pickIndexFromSlot(input.randomSlots.category!, CHAIN_CATEGORIES.length)]!;
      return done(
        outcome("Tour de table", [
          `Catégorie : ${category}.`,
          "Une réponse différente chacun, en moins de 3 secondes.",
          "Le premier qui bloque, répète ou se trompe boit 2 gorgées.",
        ]),
      );
    },
  },
  {
    id: "t11",
    category: "TOUS",
    title: "Camp contre camp",
    prompt:
      "L'application affiche une question ou opinion à deux choix. Tout le monde choisit simultanément un camp. La minorité boit 1 ; égalité parfaite = tout le monde boit 1.",
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
          `${prompt.left} ou ${prompt.right} ? 3, 2, 1 : choisissez votre camp.`,
        );
      }
      if (input.choiceKey === "tie")
        return done(
          outcome("Camp contre camp", ["Égalité parfaite : tout le monde boit 1 gorgée."]),
        );
      const minorityLabel = input.choiceKey === "left" ? prompt.right : prompt.left;
      return done(outcome("Camp contre camp", [`La minorité (${minorityLabel}) boit 1 gorgée.`]));
    },
  },
  {
    id: "t12",
    category: "TOUS",
    title: "Estimation collective",
    prompt:
      "L'application pose une question numérique. Chacun annonce une estimation. Le plus proche distribue 2 gorgées ; le plus éloigné boit 2.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "question")) return needRandom("question");
      const item =
        ESTIMATION_QUESTIONS[
          pickIndexFromSlot(input.randomSlots.question!, ESTIMATION_QUESTIONS.length)
        ]!;
      const answer = item.unit ? `${item.answer} ${item.unit}` : `${item.answer}`;
      return done(
        outcome("Estimation collective", [
          item.question,
          `Réponse : ${answer}`,
          "Le plus proche distribue 2 gorgées, le plus éloigné boit 2 gorgées.",
        ]),
      );
    },
  },
];
