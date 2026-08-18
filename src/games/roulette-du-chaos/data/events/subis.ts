// SUBIS — the active player gets a negative outcome. See spec section 12
// (S1-S8).

import { nextPlayerIndex } from "../../lib/game/players";
import {
  done,
  drinks,
  flipCoin,
  hasSlots,
  needChoice,
  needMiniGame,
  needRandom,
  needTargets,
  outcome,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

function simpleActivePenalty(
  id: string,
  title: string,
  prompt: string,
  amount: number,
): EventDefinition {
  return {
    id,
    category: "SUBIS",
    title,
    prompt,
    visualHint: "none",
    resolve(input) {
      return done(
        outcome(title, [drinks(playerName(input.players, input.activePlayerId), amount)]),
      );
    },
  };
}

export const subisEvents: EventDefinition[] = [
  simpleActivePenalty("s1", "Classique", "Tu bois 2 gorgées.", 2),
  simpleActivePenalty("s2", "Pas ton jour", "Tu bois 3 gorgées.", 3),
  simpleActivePenalty("s3", "Sale tour", "Tu bois 4 gorgées.", 4),
  {
    id: "s4",
    category: "SUBIS",
    title: "Avec un ami",
    prompt: "Choisis un joueur : vous buvez tous les deux 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      const target = input.targetRounds[0]?.[0];
      if (!target) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis ton complice",
        });
      }
      return done(
        outcome("Avec un ami", [
          drinks(playerName(input.players, input.activePlayerId), 2),
          drinks(playerName(input.players, target), 2),
        ]),
      );
    },
  },
  {
    id: "s5",
    category: "SUBIS",
    title: "Sauve-toi",
    prompt: "Prends 3 gorgées maintenant, ou tente un défi Stop Timer pour t'en sortir.",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "prendre", label: "PRENDRE 3" },
          { key: "tenter", label: "TENTER LE DÉFI" },
        ]);
      }
      if (input.choiceKey === "prendre") return done(outcome("Sauve-toi", [drinks(activeName, 3)]));
      if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", input.activePlayerId);
      return input.miniGameResult.success
        ? done(outcome("Défi réussi !", ["Tu t'en sors sans boire."]))
        : done(outcome("Défi manqué", [drinks(activeName, 3)]));
    },
  },
  {
    id: "s6",
    category: "SUBIS",
    title: "Le voisin paie aussi",
    prompt: "Tu bois 2 gorgées. Ton voisin de droite boit 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      const index = input.players.findIndex((player) => player.id === input.activePlayerId);
      const neighbor = input.players[nextPlayerIndex(index, input.players.length)]!;
      return done(
        outcome("Le voisin paie aussi", [
          drinks(playerName(input.players, input.activePlayerId), 2),
          drinks(neighbor.name, 1),
        ]),
      );
    },
  },
  {
    id: "s7",
    category: "SUBIS",
    title: "Vote de confiance",
    prompt: "Le groupe vote à main levée : pardon ou condamnation ?",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "pardonner", label: "PARDONNER" },
            { key: "condamner", label: "CONDAMNER" },
          ],
          "Le groupe vote à main levée.",
        );
      }
      return input.choiceKey === "pardonner"
        ? done(outcome("Pardonné", [drinks(activeName, 1)]))
        : done(outcome("Condamné", [drinks(activeName, 3)]));
    },
  },
  {
    id: "s8",
    category: "SUBIS",
    title: "Quitte ou double",
    prompt: "Accepte 2 gorgées, ou tente ta chance à pile ou face pour ne rien boire.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "accepter", label: "ACCEPTER 2" },
          { key: "tenter", label: "TENTER TA CHANCE" },
        ]);
      }
      if (input.choiceKey === "accepter")
        return done(outcome("Quitte ou double", [drinks(activeName, 2)]));
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      return flipCoin(input.randomSlots.coin!) === "heads"
        ? done(outcome("Chance !", ["Tu ne bois rien."]))
        : done(outcome("Double ou rien...", [drinks(activeName, 4)]));
    },
  },
];
