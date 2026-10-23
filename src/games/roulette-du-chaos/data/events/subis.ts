// SUBIS — the active player gets a negative outcome. See spec section 12
// (S1-S12).

import { MIME_WORDS } from "../content/mime-words";
import { nextPlayerIndex } from "../../lib/game/players";
import {
  done,
  drinks,
  flipCoin,
  hasSlots,
  makeRule,
  needChoice,
  needMiniGame,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
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

export const subisEvents: EventDefinition[] = (
  [
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
        const activeName = playerName(input.players, input.activePlayerId);
        return done(
          outcome("Avec un ami", [
            `${activeName} boit 2 gorgées — et désigne un complice qui boit aussi 2 gorgées.`,
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
        if (input.choiceKey === "prendre")
          return done(outcome("Sauve-toi", [drinks(activeName, 3)]));
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
      title: "Réflexe subi",
      prompt: "Lance le mini-jeu Réflexes. Réussi : rien. Raté : tu bois 2 gorgées.",
      visualHint: "duel",
      resolve(input) {
        const activeName = playerName(input.players, input.activePlayerId);
        if (!input.miniGameResult) return needMiniGame("reflex", "solo", input.activePlayerId);
        return input.miniGameResult.success
          ? done(outcome("Réflexe subi", ["Réussi ! Tu ne bois rien."]))
          : done(outcome("Réflexe subi", [drinks(activeName, 2)]));
      },
    },
    {
      id: "s8",
      category: "SUBIS",
      title: "Quitte ou double",
      prompt:
        "Bois 2 gorgées maintenant, ou tente pile ou face : gagné = rien ; perdu = 4 gorgées.",
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
    {
      id: "s9",
      category: "SUBIS",
      title: "Stop express",
      prompt: "Réussis le mini-jeu Stop Timer pour t'en sortir. Raté : tu bois 2 gorgées.",
      visualHint: "duel",
      resolve(input) {
        const activeName = playerName(input.players, input.activePlayerId);
        if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", input.activePlayerId);
        return input.miniGameResult.success
          ? done(outcome("Stop express", ["Bien joué, tu ne bois rien."]))
          : done(outcome("Stop express", [drinks(activeName, 2)]));
      },
    },
    {
      id: "s10",
      category: "SUBIS",
      title: "Tap ou bois",
      prompt: "Lance Tap Battle en solo. Réussi : rien. Raté : tu bois 2 gorgées.",
      visualHint: "duel",
      resolve(input) {
        const activeName = playerName(input.players, input.activePlayerId);
        if (!input.miniGameResult) return needMiniGame("tapBattle", "solo", input.activePlayerId);
        return input.miniGameResult.success
          ? done(outcome("Tap ou bois", ["Réussi ! Tu ne bois rien."]))
          : done(outcome("Tap ou bois", [drinks(activeName, 2)]));
      },
    },
    {
      id: "s11",
      category: "SUBIS",
      title: "Duel express",
      prompt: "Choisis un joueur pour un pierre-feuille-ciseaux. Le perdant boit 2 gorgées.",
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
          return needMiniGame("rps", "duel", input.activePlayerId, opponentId);
        }
        const loserId = result.loserId ?? input.activePlayerId;
        return done(outcome("Duel express", [drinks(playerName(input.players, loserId), 2)]));
      },
    },
    {
      id: "s12",
      category: "SUBIS",
      title: "Mime ou sanction",
      prompt:
        "L'application te donne un mot à faire deviner en 20 secondes sans parler. Réussi = rien ; raté = 3 gorgées.",
      visualHint: "none",
      resolve(input) {
        if (!hasSlots(input.randomSlots, "word")) return needRandom("word");
        const word = MIME_WORDS[pickIndexFromSlot(input.randomSlots.word!, MIME_WORDS.length)]!;
        if (!input.choiceKey) {
          return needChoice(
            [
              { key: "reussi", label: "DEVINÉ !" },
              { key: "rate", label: "RATÉ" },
            ],
            `À mimer en 20 secondes, sans parler : ${word}`,
          );
        }
        const activeName = playerName(input.players, input.activePlayerId);
        return input.choiceKey === "reussi"
          ? done(outcome("Mime réussi !", [`« ${word} » deviné. Tu ne bois rien.`]))
          : done(outcome("Mime raté", [`C'était : « ${word} ».`, drinks(activeName, 3)]));
      },
    },
    {
      id: "s13",
      category: "SUBIS",
      title: "Voix de complot",
      prompt: "Pendant trois tours de table, tu ne parles qu'en chuchotant. Un oubli = 1 gorgée.",
      visualHint: "none",
      resolve(input) {
        const name = playerName(input.players, input.activePlayerId);
        const instruction = `${name} ne parle qu'en chuchotant. Chaque oubli lui coûte 1 gorgée.`;
        return done(
          outcome("Voix de complot", [instruction], "rule"),
          makeRule(
            "s13",
            "Voix de complot",
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
).map((event) => ({ ...event, weight: ["s1", "s2", "s3", "s6", "s8"].includes(event.id) ? 1 : 5 }));
