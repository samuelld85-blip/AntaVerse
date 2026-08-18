// DISTRIBUE — the active player hands out sips. Mostly positive for them.
// See spec section 11 (D1-D8).

import { nextPlayerIndex, pickBySlot, previousPlayerIndex } from "../../lib/game/players";
import {
  done,
  drinks,
  eligibleOthers,
  flipCoin,
  freeDistributeEvent,
  hasSlots,
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
    2,
  ),
  freeDistributeEvent("d2", "DISTRIBUE", "Généreux", "Distribue 3 gorgées comme tu veux.", 3, 3),
  freeDistributeEvent(
    "d3",
    "DISTRIBUE",
    "Grande tournée",
    "Distribue 4 gorgées comme tu veux.",
    4,
    4,
  ),
  {
    id: "d4",
    category: "DISTRIBUE",
    title: "Double cible",
    prompt: "Choisis deux joueurs différents. Chacun reçoit 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      const others = eligibleOthers(input.players, input.activePlayerId);
      const count = Math.min(2, others.length);
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(count, count, {
          excludeIds: [input.activePlayerId],
          label: "Choisis 2 joueurs",
        });
      }
      const lines = targets.map((id) => receives(playerName(input.players, id), 2));
      return done(outcome("Double cible", lines));
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
    3,
    3,
  ),
  {
    id: "d8",
    category: "DISTRIBUE",
    title: "Tête-à-tête",
    prompt: "Choisis un adversaire pour un tirage à pile ou face virtuel.",
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
      if (flipCoin(input.randomSlots.coin!) === "heads") {
        return done(outcome("Tête-à-tête", [receives(targetName, 3)]));
      }
      return done(outcome("Tête-à-tête", [drinks(activeName, 1)]));
    },
  },
];
