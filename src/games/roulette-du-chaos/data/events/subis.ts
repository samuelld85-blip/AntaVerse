// SUBIS — the active player gets a negative outcome. See spec section 12
// (S1-S12).

import { CONFESSION_QUESTIONS } from "../content/confession-questions";
import { MIME_WORDS } from "../content/mime-words";
import { VERDICT_STATEMENTS } from "../content/verdict-statements";
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
    prompt:
      "Le groupe vote à main levée : PARDON = tu ne bois rien ; CONDAMNATION = tu bois 3 gorgées. En cas d'égalité, tu bois 1.",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "pardonner", label: "PARDON" },
            { key: "condamner", label: "CONDAMNATION" },
            { key: "egalite", label: "ÉGALITÉ" },
          ],
          "Le groupe vote à main levée.",
        );
      }
      if (input.choiceKey === "pardonner") return done(outcome("Pardonné", ["Tu ne bois rien."]));
      if (input.choiceKey === "egalite") return done(outcome("Égalité", [drinks(activeName, 1)]));
      return done(outcome("Condamné", [drinks(activeName, 3)]));
    },
  },
  {
    id: "s8",
    category: "SUBIS",
    title: "Quitte ou double",
    prompt: "Bois 2 gorgées maintenant, ou tente pile ou face : gagné = rien ; perdu = 4 gorgées.",
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
    title: "Confession express",
    prompt:
      "L'application affiche une question personnelle ou épicée. Réponds honnêtement, ou bois 2 gorgées.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "question")) return needRandom("question");
      const question =
        CONFESSION_QUESTIONS[
          pickIndexFromSlot(input.randomSlots.question!, CONFESSION_QUESTIONS.length)
        ]!;
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "repondre", label: "J'AI RÉPONDU" },
            { key: "passer", label: "JE PASSE" },
          ],
          question,
        );
      }
      const activeName = playerName(input.players, input.activePlayerId);
      return input.choiceKey === "repondre"
        ? done(outcome("Confession express", [question, "Réponse assumée : tu ne bois rien."]))
        : done(outcome("Confession express", [question, drinks(activeName, 2)]));
    },
  },
  {
    id: "s10",
    category: "SUBIS",
    title: "Le tribunal",
    prompt:
      "L'application affiche une affirmation sur toi. Le groupe vote VRAI ou FAUX. Si la majorité vote VRAI, tu bois 2 ; sinon, les votants VRAI boivent 1.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "statement")) return needRandom("statement");
      const statement =
        VERDICT_STATEMENTS[
          pickIndexFromSlot(input.randomSlots.statement!, VERDICT_STATEMENTS.length)
        ]!;
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "vrai", label: "MAJORITÉ VRAI" },
            { key: "faux", label: "MAJORITÉ FAUX" },
          ],
          statement,
        );
      }
      const activeName = playerName(input.players, input.activePlayerId);
      return input.choiceKey === "vrai"
        ? done(outcome("Coupable", [statement, drinks(activeName, 2)]))
        : done(outcome("Acquitté", [statement, "Ceux qui ont voté VRAI boivent 1 gorgée."]));
    },
  },
  {
    id: "s11",
    category: "SUBIS",
    title: "Appel à un ami",
    prompt:
      "Choisis un joueur. Il peut te sauver en buvant 1 gorgée. S'il refuse, tu bois 3 gorgées.",
    visualHint: "none",
    resolve(input) {
      const friendId = input.targetRounds[0]?.[0];
      if (!friendId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Qui appelles-tu à la rescousse ?",
        });
      }
      const friendName = playerName(input.players, friendId);
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "sauve", label: "IL ACCEPTE" },
            { key: "refuse", label: "IL REFUSE" },
          ],
          `${friendName}, tu bois 1 gorgée pour sauver ${activeName} ?`,
        );
      }
      return input.choiceKey === "sauve"
        ? done(outcome("Sauvé !", [drinks(friendName, 1), `${activeName} ne boit rien.`]))
        : done(outcome("Abandonné", [`${friendName} refuse.`, drinks(activeName, 3)]));
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
];
