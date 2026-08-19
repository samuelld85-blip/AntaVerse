// DESTIN — the application decides, with very little player control. See
// spec section 24 (F1-F12).

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
  outcome,
  pickIndexFromSlot,
  playerName,
  rollDie,
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
      return done(outcome("Dé du destin", ["Distribue 2 gorgées — gérez entre vous."]));
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
      return done(
        outcome("Cadeau tombé du ciel", [
          `${distributor.name} distribue 3 gorgées — gérez entre vous.`,
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
    prompt:
      "L'application affiche une affirmation. Tous ceux qui correspondent lèvent la main : une seule personne = elle boit 2 ; plusieurs = elles boivent 1 chacune ; personne = le joueur actif boit 1.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "prompt")) return needRandom("prompt");
      const qualifier =
        DESTINY_PROMPTS[pickIndexFromSlot(input.randomSlots.prompt!, DESTINY_PROMPTS.length)]!;
      const capitalized = qualifier.charAt(0).toUpperCase() + qualifier.slice(1);
      const activeName = playerName(input.players, input.activePlayerId);
      return done(
        outcome("Destin collectif", [
          `${capitalized} : levez la main.`,
          "Une seule main levée : elle boit 2 gorgées.",
          "Plusieurs mains : elles boivent 1 gorgée chacune.",
          `Aucune main : ${drinks(activeName, 1)}.`,
        ]),
      );
    },
  },
  {
    id: "f9",
    category: "DESTIN",
    title: "La cascade",
    prompt:
      "L'application choisit un joueur de départ et un sens. En suivant le cercle, un joueur sur deux boit 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "start", "direction"))
        return needRandom("start", "direction");
      const count = input.players.length;
      const startIndex = Math.min(count - 1, Math.floor(input.randomSlots.start! * count));
      const clockwise = input.randomSlots.direction! < 0.5;
      const drinkers: string[] = [];
      for (let step = 0; step < count; step += 2) {
        const index = clockwise ? (startIndex + step) % count : (startIndex - step + count) % count;
        drinkers.push(input.players[index]!.name);
      }
      return done(
        outcome("La cascade", [
          `Départ : ${input.players[startIndex]!.name}, sens ${clockwise ? "horaire" : "anti-horaire"}.`,
          `Un joueur sur deux boit 1 gorgée : ${drinkers.join(", ")}.`,
        ]),
      );
    },
  },
  {
    id: "f10",
    category: "DESTIN",
    title: "Bénédiction et malédiction",
    prompt:
      "L'application choisit deux joueurs différents : l'un distribue 3 gorgées, l'autre boit 2.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "blessed", "cursed")) return needRandom("blessed", "cursed");
      const [blessed, cursed] = pickDistinctBySlots(input.players, [
        input.randomSlots.blessed!,
        input.randomSlots.cursed!,
      ]);
      return done(
        outcome("Bénédiction et malédiction", [
          `${blessed!.name} distribue 3 gorgées — gérez entre vous.`,
          drinks(cursed!.name, 2),
        ]),
      );
    },
  },
  {
    id: "f11",
    category: "DESTIN",
    title: "La moitié maudite",
    prompt:
      "L'application sélectionne au hasard environ la moitié du groupe. Les joueurs sélectionnés boivent 1 gorgée.",
    visualHint: "none",
    resolve(input) {
      const slotNames = input.players.map((_, index) => `p${index}`);
      if (!hasSlots(input.randomSlots, ...slotNames)) return needRandom(...slotNames);
      const selected = input.players.filter((_, index) => input.randomSlots[`p${index}`]! < 0.5);
      // A coin flip per player can select nobody (or everybody) — fall back to
      // the single unluckiest player so the event always does something.
      const drinkers =
        selected.length > 0 && selected.length < input.players.length
          ? selected
          : [pickBySlot(input.players, input.randomSlots.p0!)];
      return done(
        outcome("La moitié maudite", [
          `${drinkers.map((player) => player.name).join(", ")} : 1 gorgée chacun.`,
        ]),
      );
    },
  },
  {
    id: "f12",
    category: "DESTIN",
    title: "Dernier survivant",
    prompt:
      "L'application élimine aléatoirement les joueurs un par un jusqu'à n'en laisser qu'un. Le survivant distribue 3 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "survivor")) return needRandom("survivor");
      const survivor = pickBySlot(input.players, input.randomSlots.survivor!);
      return done(
        outcome("Dernier survivant", [
          `${survivor.name} est le dernier survivant !`,
          `${survivor.name} distribue 3 gorgées — gérez entre vous.`,
        ]),
      );
    },
  },
];
