// DISTRIBUE — the active player hands out sips. Mostly positive for them.
// See spec section 11 (D1-D12).

import { nextPlayerIndex, pickBySlot, previousPlayerIndex } from "../../lib/game/players";
import {
  done,
  drinks,
  eligibleOthers,
  flipCoin,
  freeDistributeEvent,
  hasSlots,
  narratedEvent,
  needChoice,
  needNeighbor,
  needRandom,
  needTargets,
  outcome,
  playerName,
  receives,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

function activeIndex(input: { players: { id: string }[]; activePlayerId: string }): number {
  return input.players.findIndex((player) => player.id === input.activePlayerId);
}

export const distribueEvents: EventDefinition[] = [
  freeDistributeEvent(
    "d1",
    "DISTRIBUE",
    "Petit cadeau",
    "Distribue 2 gorgées : à un seul joueur, ou 1 + 1 entre deux joueurs.",
    2,
  ),
  freeDistributeEvent("d2", "DISTRIBUE", "Généreux", "Distribue 3 gorgées comme tu veux.", 3),
  freeDistributeEvent("d3", "DISTRIBUE", "Grande tournée", "Distribue 4 gorgées comme tu veux.", 4),
  {
    id: "d4",
    category: "DISTRIBUE",
    title: "Double cible",
    prompt: "Choisis deux joueurs différents. Chacun reçoit 2 gorgées.",
    visualHint: "none",
    resolve() {
      return done(
        outcome("Double cible", ["Désignez 2 joueurs entre vous — chacun boit 2 gorgées."]),
      );
    },
  },
  {
    id: "d5",
    category: "DISTRIBUE",
    title: "Voisinage",
    prompt: "Choisis ton voisin de gauche ou de droite. Il ou elle reçoit 3 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!input.neighborSide) return needNeighbor();
      const count = input.players.length;
      const index = activeIndex(input);
      const neighborIndex =
        input.neighborSide === "left"
          ? previousPlayerIndex(index, count)
          : nextPlayerIndex(index, count);
      const neighbor = input.players[neighborIndex]!;
      return done(outcome("Voisinage", [receives(neighbor.name, 3)]));
    },
  },
  {
    id: "d6",
    category: "DISTRIBUE",
    title: "Rien de personnel",
    prompt: "L'application choisit une victime au hasard. Elle reçoit 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "target")) return needRandom("target");
      const others = eligibleOthers(input.players, input.activePlayerId);
      const target = pickBySlot(others, input.randomSlots.target!);
      return done(outcome("Rien de personnel", [receives(target.name, 2)]));
    },
  },
  freeDistributeEvent(
    "d7",
    "DISTRIBUE",
    "Un pour chacun",
    "Choisis trois joueurs différents. Chacun reçoit 1 gorgée.",
    3,
  ),
  {
    id: "d8",
    category: "DISTRIBUE",
    title: "Tête-à-tête",
    prompt: "Choisis un adversaire pour un pile ou face virtuel. Le perdant boit 2 gorgées.",
    visualHint: "coin",
    resolve(input) {
      const target = input.targetRounds[0]?.[0];
      if (!target) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis ton adversaire",
        });
      }
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      const activeName = playerName(input.players, input.activePlayerId);
      const targetName = playerName(input.players, target);
      const loserName = flipCoin(input.randomSlots.coin!) === "heads" ? targetName : activeName;
      return done(outcome("Tête-à-tête", [drinks(loserName, 2)]));
    },
  },
  {
    id: "d9",
    category: "DISTRIBUE",
    title: "La chaîne",
    prompt:
      "Choisis un premier joueur qui boit 1 gorgée. Il désigne ensuite un autre joueur, puis ce joueur en désigne un troisième. Personne ne peut être choisi deux fois.",
    visualHint: "none",
    resolve(input) {
      const first = input.targetRounds[0]?.[0];
      if (!first) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis le premier maillon",
        });
      }
      return done(
        outcome("La chaîne", [
          drinks(playerName(input.players, first), 1),
          "Il ou elle désigne un deuxième joueur, qui boit 1 gorgée et en désigne un troisième.",
          "Personne ne peut être choisi deux fois.",
        ]),
      );
    },
  },
  {
    id: "d10",
    category: "DISTRIBUE",
    title: "Tout sur un ou presque",
    prompt:
      "Choisis : distribuer 4 gorgées à une seule personne, ou 5 gorgées réparties entre au moins trois joueurs.",
    visualHint: "none",
    resolve(input) {
      if (!input.choiceKey) {
        return needChoice([
          { key: "concentre", label: "4 SUR UNE SEULE" },
          { key: "reparti", label: "5 SUR TROIS +" },
        ]);
      }
      return input.choiceKey === "concentre"
        ? done(outcome("Tout sur un", ["Une seule personne encaisse 4 gorgées."]))
        : done(
            outcome("Ou presque", [
              "Distribue 5 gorgées entre au moins trois joueurs — gérez entre vous.",
            ]),
          );
    },
  },
  {
    id: "d11",
    category: "DISTRIBUE",
    title: "Passe le pouvoir",
    prompt:
      "Choisis un joueur : il distribue 4 gorgées comme il veut, mais il n'a pas le droit de t'en donner.",
    visualHint: "none",
    resolve(input) {
      const heir = input.targetRounds[0]?.[0];
      if (!heir) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "À qui passes-tu le pouvoir ?",
        });
      }
      const activeName = playerName(input.players, input.activePlayerId);
      return done(
        outcome("Passe le pouvoir", [
          `${playerName(input.players, heir)} distribue 4 gorgées comme il ou elle veut.`,
          `Interdiction d'en donner à ${activeName}.`,
        ]),
      );
    },
  },
  narratedEvent(
    "d12",
    "DISTRIBUE",
    "Arrosage contrôlé",
    "Distribue 5 gorgées comme tu veux, avec un maximum de 2 gorgées par personne.",
    ["Distribue 5 gorgées — maximum 2 par personne. Gérez entre vous."],
  ),
];
