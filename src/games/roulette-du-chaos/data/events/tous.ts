// TOUS — the whole group participates. See spec section 22 (T1-T12). Several
// of these are physically self-arbitrated (nobody can detect who pointed at
// whom, or who spoke first) — the app narrates the rule and, where the spec
// calls for it, lets the group tap in who was affected.

import { CHAIN_CATEGORIES } from "../content/chain-categories";
import { ESTIMATION_QUESTIONS } from "../content/estimation-questions";
import { MAJORITY_PROMPTS } from "../content/majority-prompts";
import { NEVER_HAVE_I_EVER } from "../content/never-have-i-ever";
import { pickBySlot } from "../../lib/game/players";
import {
  done,
  hasSlots,
  makeRule,
  needChoice,
  needRandom,
  needReveal,
  outcome,
  pickIndexFromSlot,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

const STARTING_GESTURES = [
  "tape une fois dans tes mains",
  "tape deux fois sur la table",
  "touche ton nez",
  "lève les deux pouces",
  "fais un petit salut militaire",
  "claque des doigts",
  "touche ton épaule gauche",
  "fais un cœur avec tes mains",
] as const;

export const tousEvents: EventDefinition[] = (
  [
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
      title: "Statue express",
      prompt:
        "Tout le monde prend une pose improbable et reste immobile 5 secondes. Le premier qui bouge boit 1 gorgée.",
      visualHint: "none",
      resolve() {
        return done(
          outcome("Statue express", [
            "Tout le monde prend une pose improbable et ne bouge plus pendant 5 secondes.",
            "Le premier qui bouge boit 1 gorgée.",
          ]),
        );
      },
    },
    {
      id: "t7",
      category: "TOUS",
      title: "Nombre maudit",
      prompt:
        "Tout le monde montre simultanément entre 1 et 5 doigts. Quand tout le monde a choisi, révélez le nombre maudit : ceux qui ont exactement ce nombre boivent 2 ; si personne ne l'a, le ou les plus proches boivent 1.",
      visualHint: "none",
      resolve(input) {
        if (!hasSlots(input.randomSlots, "cursed")) return needRandom("cursed");
        if (!input.revealConfirmed) return needReveal("Révéler la carte");
        const cursed = pickIndexFromSlot(input.randomSlots.cursed!, 5) + 1;
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
      title: "Pose royale",
      prompt:
        "L'application tire un joueur au sort. Il ou elle prend une pose de victoire pendant 3 secondes.",
      visualHint: "none",
      resolve(input) {
        if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
        const chosen = pickBySlot(input.players, input.randomSlots.prompt!);
        return done(
          outcome("Pose royale", [`${chosen.name} prend une pose de victoire. Tenez 3 secondes !`]),
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
          CHAIN_CATEGORIES[
            pickIndexFromSlot(input.randomSlots.category!, CHAIN_CATEGORIES.length)
          ]!;
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
        if (!input.revealConfirmed) return needReveal("Révéler la réponse", item.question);
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
    {
      id: "t13",
      category: "TOUS",
      title: "Chaîne débile",
      prompt:
        "De 3 à 12 joueurs : répétez la séquence de gestes puis ajoutez-en un chacun. Le premier qui se trompe boit 2.",
      visualHint: "none",
      resolve(input) {
        if (input.players.length < 3 || input.players.length > 12) {
          return done(
            outcome("Chaîne débile", [
              "Cette carte se joue à 3–12 joueurs. Passez-la si vous êtes hors limite.",
            ]),
          );
        }
        if (!hasSlots(input.randomSlots, "gesture")) return needRandom("gesture");
        const gesture =
          STARTING_GESTURES[
            pickIndexFromSlot(input.randomSlots.gesture!, STARTING_GESTURES.length)
          ]!;
        return done(
          outcome("Chaîne débile", [
            `Départ : ${gesture}.`,
            "Commencez par la personne qui a lancé la roulette, puis avancez dans le sens de la table. Chacun répète toute la séquence et ajoute un geste.",
            "Maximum 5 secondes par personne. Au premier oubli ou geste incorrect, la chaîne s'arrête : cette personne boit 2 gorgées.",
            "Limite : un tour par personne, jusqu'à 12 joueurs.",
          ]),
        );
      },
    },
    {
      id: "t14",
      category: "TOUS",
      title: "Votre Majesté",
      prompt:
        "Pendant trois tours de table, dites « Votre Majesté » avant chaque lancer. Un oubli = 1 gorgée.",
      visualHint: "none",
      resolve(input) {
        const instruction =
          "Avant chaque lancer, le joueur actif dit « Votre Majesté ». Un oubli coûte 1 gorgée.";
        return done(
          outcome("Votre Majesté", [instruction], "rule"),
          makeRule(
            "t14",
            "Votre Majesté",
            instruction,
            input.activePlayerId,
            "turns",
            null,
            input.players.length * 3,
          ),
        );
      },
    },
  ] satisfies EventDefinition[]
).map((event) => ({ ...event, weight: ["t1", "t5"].includes(event.id) ? 1 : 5 }));
