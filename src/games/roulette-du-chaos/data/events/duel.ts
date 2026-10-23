// DUEL — the spec (section 13) describes the category's shape (pick an
// opponent, play a clear winner/loser confrontation) without enumerating
// fixed events the way the other categories do. DL1-DL7 map one-to-one onto
// the on-screen mini-games; DL8-DL12 are table duels the group arbitrates
// itself (a gauge, a staring contest, a counting game). Normal loser
// penalty: 2 gorgées.

import { CHAIN_CATEGORIES } from "../content/chain-categories";
import {
  done,
  drinks,
  hasSlots,
  needMiniGame,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition, MiniGameKind } from "../../lib/game/types";

const BANAL_WORDS = [
  "banane",
  "chaussette",
  "café",
  "fromage",
  "fenêtre",
  "savon",
  "train",
  "fourchette",
] as const;

function duelEvent(id: string, title: string, prompt: string, kind: MiniGameKind): EventDefinition {
  return {
    id,
    category: "DUEL",
    title,
    prompt,
    visualHint: "duel",
    resolve(input) {
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis ton adversaire",
        });
      }
      const result = input.miniGameResult;
      if (!result || result.tie) {
        return needMiniGame(kind, "duel", input.activePlayerId, opponentId);
      }
      if (!result.winnerId || !result.loserId) {
        return done(outcome(title, ["Le perdant boit 2 gorgées."]));
      }
      const winnerName = playerName(input.players, result.winnerId);
      const loserName = playerName(input.players, result.loserId);
      return done(outcome(title, [`${winnerName} l'emporte !`, drinks(loserName, 2)]));
    },
  };
}

/**
 * A duel played at the table rather than on the phone: the app picks the
 * opponent and states the rule, the two players settle it themselves. The
 * outcome line always names both duellists so nobody argues about who was in.
 */
function tableDuelEvent(
  id: string,
  title: string,
  prompt: string,
  rule: (opponentName: string, activeName: string) => string[],
): EventDefinition {
  return {
    id,
    category: "DUEL",
    title,
    prompt,
    visualHint: "duel",
    resolve(input) {
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis ton adversaire",
        });
      }
      const activeName = playerName(input.players, input.activePlayerId);
      const opponentName = playerName(input.players, opponentId);
      return done(
        outcome(title, [`${activeName} contre ${opponentName}`, ...rule(opponentName, activeName)]),
      );
    },
  };
}

export const duelEvents: EventDefinition[] = (
  [
    duelEvent(
      "dl1",
      "Duel de réflexes",
      "Choisis un adversaire pour un duel de réflexes.",
      "reflex",
    ),
    duelEvent(
      "dl2",
      "Chrono commun",
      "Choisis un adversaire : au plus près de 5 secondes.",
      "stopTimer",
    ),
    duelEvent(
      "dl3",
      "Pierre-feuille-ciseaux",
      "Choisis un adversaire pour un pierre-feuille-ciseaux.",
      "rps",
    ),
    duelEvent(
      "dl4",
      "Plus ou moins",
      "Choisis un adversaire pour un duel plus ou moins.",
      "plusMinus",
    ),
    duelEvent(
      "dl5",
      "Nombre secret",
      "Choisis un adversaire pour deviner le nombre secret.",
      "secretNumber",
    ),
    duelEvent(
      "dl6",
      "Estimation éclair",
      "Choisis un adversaire pour un duel d'estimation.",
      "estimation",
    ),
    duelEvent("dl7", "Tap Battle", "Choisis un adversaire pour un duel de vitesse.", "tapBattle"),
    tableDuelEvent(
      "dl8",
      "Cible 50",
      "Une jauge défile de 0 à 100. Chacun appuie une fois : le plus proche de 50 gagne. Le perdant boit 2.",
      () => [
        "Une jauge défile de 0 à 100 : chacun appuie une fois.",
        "Le plus proche de 50 gagne — le perdant boit 2 gorgées.",
      ],
    ),
    tableDuelEvent(
      "dl9",
      "Face à face",
      "Choisis un adversaire. Regardez-vous sans détourner les yeux ni rire. Le premier qui craque boit 2.",
      () => [
        "Regardez-vous sans détourner les yeux ni rire.",
        "Le premier qui craque boit 2 gorgées.",
      ],
    ),
    tableDuelEvent(
      "dl10",
      "Le 21",
      "À tour de rôle, annoncez 1, 2 ou 3 nombres consécutifs en partant de 1. Celui qui prononce 21 perd et boit 2.",
      () => [
        "À tour de rôle, annoncez 1, 2 ou 3 nombres consécutifs en partant de 1.",
        "Celui qui prononce 21 perd et boit 2 gorgées.",
      ],
    ),
    {
      id: "dl11",
      category: "DUEL",
      title: "Mot en chaîne",
      prompt:
        "L'application donne une catégorie. À tour de rôle, donnez une réponse différente en moins de 3 secondes. Répétition, erreur ou blanc = 2 gorgées.",
      visualHint: "duel",
      resolve(input) {
        const opponentId = input.targetRounds[0]?.[0];
        if (!opponentId) {
          return needTargets(1, 1, {
            excludeIds: [input.activePlayerId],
            label: "Choisis ton adversaire",
          });
        }
        if (!hasSlots(input.randomSlots, "category")) return needRandom("category");
        const category =
          CHAIN_CATEGORIES[
            pickIndexFromSlot(input.randomSlots.category!, CHAIN_CATEGORIES.length)
          ]!;
        const activeName = playerName(input.players, input.activePlayerId);
        const opponentName = playerName(input.players, opponentId);
        return done(
          outcome("Mot en chaîne", [
            `${activeName} contre ${opponentName}`,
            `Catégorie : ${category}.`,
            "Une réponse différente chacun son tour, en moins de 3 secondes.",
            "Répétition, erreur ou blanc : 2 gorgées.",
          ]),
        );
      },
    },
    tableDuelEvent(
      "dl12",
      "Ni oui ni non",
      "Pendant 15 secondes, posez-vous des questions à tour de rôle. Le premier qui dit « oui » ou « non » perd.",
      () => [
        "Pendant 15 secondes, posez-vous des questions à tour de rôle.",
        "Le premier qui dit « oui » ou « non » boit 2 gorgées.",
      ],
    ),
    tableDuelEvent(
      "dl13",
      "Pierre-papier-ciseaux éclair",
      "Choisis un adversaire. Faites trois manches de pierre-feuille-ciseaux : le premier à deux manches gagne.",
      () => [
        "Jouez trois manches de pierre-feuille-ciseaux : le premier à deux manches gagne.",
        "Le perdant boit 2 gorgées.",
      ],
    ),
    tableDuelEvent(
      "dl14",
      "Réponse éclair",
      "Choisis un adversaire. Trouvez chacun un mot commençant par M en 10 secondes. Le plus lent perd.",
      () => [
        "Trouvez chacun un mot qui commence par M. Vous avez 10 secondes.",
        "Le plus lent à répondre boit 2 gorgées. Égalité : personne ne boit.",
      ],
    ),
    tableDuelEvent(
      "dl15",
      "Pouce de fer",
      "Choisis un adversaire. Pouces levés, comptez jusqu'à 3 et essayez de coincer le pouce de l'autre. Une manche.",
      () => [
        "Pouces levés : comptez jusqu'à 3 et essayez de coincer le pouce adverse. Une manche.",
        "Le perdant boit 2 gorgées.",
      ],
    ),
    tableDuelEvent(
      "dl16",
      "Mot interdit",
      "Choisis un adversaire. Pendant 15 secondes, discutez. Le premier à dire le mot « voilà » perd.",
      () => [
        "Pendant 15 secondes, discutez normalement. Le premier à dire « voilà » boit 2 gorgées.",
      ],
    ),
    {
      id: "dl17",
      category: "DUEL",
      title: "Fais-le dire",
      prompt:
        "Choisis un adversaire. Regardez le mot ensemble, puis tu as 20 secondes pour le lui faire dire sans le prononcer.",
      visualHint: "duel",
      resolve(input) {
        const opponentId = input.targetRounds[0]?.[0];
        if (!opponentId) {
          return needTargets(1, 1, {
            excludeIds: [input.activePlayerId],
            label: "Choisis ton adversaire",
          });
        }
        if (!hasSlots(input.randomSlots, "word")) return needRandom("word");
        const word = BANAL_WORDS[pickIndexFromSlot(input.randomSlots.word!, BANAL_WORDS.length)]!;
        const activeName = playerName(input.players, input.activePlayerId);
        const opponentName = playerName(input.players, opponentId);
        if (!input.choiceKey) {
          return {
            status: "needsInput",
            next: {
              kind: "wordDuel",
              word,
              attackerId: input.activePlayerId,
              defenderId: opponentId,
              durationSeconds: 20,
            },
          };
        }
        const loserName = input.choiceKey === "defenderSaid" ? opponentName : activeName;
        return done(
          outcome("Fais-le dire", [
            input.choiceKey === "defenderSaid"
              ? `${activeName} a réussi à faire dire « ${word} » à ${opponentName} !`
              : input.choiceKey === "attackerSaid"
                ? `${activeName} a prononcé le mot interdit : « ${word} ».`
                : `${opponentName} a tenu 20 secondes sans dire « ${word} ».`,
            drinks(loserName, 2),
          ]),
        );
      },
    },
  ] satisfies EventDefinition[]
).map((event) => ({ ...event, weight: 5 }));
