// DESTIN — the application decides, with very little player control. See
// spec section 24 (F1-F8).

import { DESTINY_PROMPTS } from "../content/destiny-prompts";
import {
  nextPlayerIndex,
  pickBySlot,
  pickDistinctBySlots,
  previousPlayerIndex,
} from "../../lib/game/players";
import {
  DUEL_MINI_GAMES,
  done,
  drinks,
  eligibleOthers,
  hasSlots,
  needMiniGame,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
  receives,
  rollDie,
  splitEvenly,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

export const destinEvents: EventDefinition[] = [
  {
    id: "f1",
    category: "DESTIN",
    title: "Victime du destin",
    prompt: "L'application choisit un joueur au hasard. Il ou elle boit 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "victim")) return needRandom("victim");
      const victim = pickBySlot(input.players, input.randomSlots.victim!);
      return done(outcome("Victime du destin", [drinks(victim.name, 2)]));
    },
  },
  {
    id: "f2",
    category: "DESTIN",
    title: "Duo maudit",
    prompt: "L'application choisit deux joueurs au hasard. Ils boivent 1 gorgée chacun.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "a", "b")) return needRandom("a", "b");
      const [first, second] = pickDistinctBySlots(input.players, [
        input.randomSlots.a!,
        input.randomSlots.b!,
      ]);
      return done(outcome("Duo maudit", [drinks(first!.name, 1), drinks(second!.name, 1)]));
    },
  },
  {
    id: "f3",
    category: "DESTIN",
    title: "Justice",
    prompt: "Pile : c'est toi. Face : l'application choisit un autre joueur. 2 gorgées.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!hasSlots(input.randomSlots, "role")) return needRandom("role");
      if (input.randomSlots.role! < 0.5) return done(outcome("Justice", [drinks(activeName, 2)]));
      if (!hasSlots(input.randomSlots, "other")) return needRandom("other");
      const others = eligibleOthers(input.players, input.activePlayerId);
      const chosen = pickBySlot(others, input.randomSlots.other!);
      return done(outcome("Justice", [drinks(chosen.name, 2)]));
    },
  },
  {
    id: "f4",
    category: "DESTIN",
    title: "Duel imposé",
    prompt:
      "L'application tire deux joueurs au sort pour un duel imposé. Le perdant boit 2 gorgées.",
    visualHint: "duel",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "a", "b", "kind")) return needRandom("a", "b", "kind");
      const [playerA, playerB] = pickDistinctBySlots(input.players, [
        input.randomSlots.a!,
        input.randomSlots.b!,
      ]);
      const kind =
        DUEL_MINI_GAMES[pickIndexFromSlot(input.randomSlots.kind!, DUEL_MINI_GAMES.length)]!;
      const result = input.miniGameResult;
      if (!result || result.tie) return needMiniGame(kind, "duel", playerA!.id, playerB!.id);
      return done(outcome("Duel imposé", [drinks(playerName(input.players, result.loserId), 2)]));
    },
  },
  {
    id: "f5",
    category: "DESTIN",
    title: "Dé du destin",
    prompt: "1-2 : tu bois 2. 3-4 : rien. 5-6 : tu distribues 2.",
    visualHint: "die",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!hasSlots(input.randomSlots, "die")) return needRandom("die");
      const die = rollDie(input.randomSlots.die!);
      if (die <= 2) return done(outcome("Dé du destin", [drinks(activeName, 2)]));
      if (die <= 4) return done(outcome("Dé du destin", ["Rien ne se passe. Chanceux !"]));
      const others = eligibleOthers(input.players, input.activePlayerId);
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(2, others.length), {
          excludeIds: [input.activePlayerId],
          label: "Distribue 2 gorgées",
        });
      }
      const amounts = splitEvenly(2, targets.length);
      return done(
        outcome(
          "Dé du destin",
          targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
        ),
      );
    },
  },
  {
    id: "f6",
    category: "DESTIN",
    title: "Cadeau tombé du ciel",
    prompt: "L'application choisit un joueur au hasard : il ou elle distribue 3 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "distributor")) return needRandom("distributor");
      const others = eligibleOthers(input.players, input.activePlayerId);
      const distributor = pickBySlot(others, input.randomSlots.distributor!);
      const pool = input.players.filter((player) => player.id !== distributor.id);
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(3, pool.length), {
          excludeIds: [distributor.id],
          label: `${distributor.name} distribue 3 gorgées`,
        });
      }
      const amounts = splitEvenly(3, targets.length);
      return done(
        outcome("Cadeau tombé du ciel", [
          `${distributor.name} distribue :`,
          ...targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
        ]),
      );
    },
  },
  {
    id: "f7",
    category: "DESTIN",
    title: "Gauche ou droite",
    prompt: "L'application tire au hasard un côté. Ce voisin boit 2 gorgées.",
    visualHint: "coin",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "side")) return needRandom("side");
      const index = input.players.findIndex((player) => player.id === input.activePlayerId);
      const count = input.players.length;
      const neighborIndex =
        input.randomSlots.side! < 0.5
          ? previousPlayerIndex(index, count)
          : nextPlayerIndex(index, count);
      const neighbor = input.players[neighborIndex]!;
      return done(outcome("Gauche ou droite", [drinks(neighbor.name, 2)]));
    },
  },
  {
    id: "f8",
    category: "DESTIN",
    title: "Destin collectif",
    prompt: "Un point commun neutre est tiré au sort. Ceux qui correspondent boivent 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
      const qualifier =
        DESTINY_PROMPTS[pickIndexFromSlot(input.randomSlots.prompt!, DESTINY_PROMPTS.length)]!;
      const capitalized = qualifier.charAt(0).toUpperCase() + qualifier.slice(1);
      return done(outcome("Destin collectif", [`${capitalized} boivent 1 gorgée chacun.`]));
    },
  },
];
