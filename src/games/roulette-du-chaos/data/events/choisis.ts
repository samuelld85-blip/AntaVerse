// CHOISIS — risk vs. reward, decision-making. See spec section 23 (C1-C12).

import { CONFESSION_QUESTIONS } from "../content/confession-questions";
import {
  done,
  drinks,
  flipCoin,
  hasSlots,
  makeRule,
  needChoice,
  needMiniGame,
  needMystery,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
  receives,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

export const choisisEvents: EventDefinition[] = [
  {
    id: "c1",
    category: "CHOISIS",
    title: "Safe ou Risk",
    prompt: "SAFE : distribue 1 gorgée. RISK : pile ou face pour distribuer 4, ou boire 3.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "safe", label: "SAFE" },
          { key: "risk", label: "RISK" },
        ]);
      }
      if (input.choiceKey === "safe") {
        return done(outcome("Safe", ["Distribue 1 gorgée — gérez entre vous."]));
      }
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      if (flipCoin(input.randomSlots.coin!) !== "heads") {
        return done(outcome("Risk manqué", [drinks(activeName, 3)]));
      }
      return done(outcome("Risk réussi !", ["Distribue 4 gorgées — gérez entre vous."]));
    },
  },
  {
    id: "c2",
    category: "CHOISIS",
    title: "Pile ou double",
    prompt: "Accepte 2 gorgées, ou tente ta chance : rien, ou 4 gorgées.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "accepter", label: "ACCEPTER 2" },
          { key: "tenter", label: "TENTER" },
        ]);
      }
      if (input.choiceKey === "accepter")
        return done(outcome("Pile ou double", [drinks(activeName, 2)]));
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      return flipCoin(input.randomSlots.coin!) === "heads"
        ? done(outcome("Chance !", ["Tu ne bois rien."]))
        : done(outcome("Double...", [drinks(activeName, 4)]));
    },
  },
  {
    id: "c3",
    category: "CHOISIS",
    title: "Toi ou lui",
    prompt: "Choisis un adversaire, puis MOI (tu bois 1) ou LUI (il tente un défi Stop Timer).",
    visualHint: "none",
    resolve(input) {
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis un adversaire",
        });
      }
      const activeName = playerName(input.players, input.activePlayerId);
      const opponentName = playerName(input.players, opponentId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "moi", label: "MOI" },
          { key: "lui", label: "LUI" },
        ]);
      }
      if (input.choiceKey === "moi") return done(outcome("Toi ou lui", [drinks(activeName, 1)]));
      if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", opponentId);
      return input.miniGameResult.success
        ? done(outcome("Défi réussi !", [receives(activeName, 2)]))
        : done(outcome("Défi manqué", [drinks(opponentName, 3)]));
    },
  },
  {
    id: "c4",
    category: "CHOISIS",
    title: "Mystère A / B / C",
    prompt: "Trois cartes face cachée : distribue 3, bois 2, ou rien. Choisis-en une.",
    visualHint: "mystery",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!hasSlots(input.randomSlots, "outcome")) return needRandom("outcome");
      if (input.mysteryPickIndex === null) return needMystery(3);
      const outcomeIndex = pickIndexFromSlot(input.randomSlots.outcome!, 3);
      if (outcomeIndex === 0)
        return done(outcome("Carte A", ["Distribue 3 gorgées — gérez entre vous."]));
      if (outcomeIndex === 1) return done(outcome("Carte B", [drinks(activeName, 2)]));
      return done(outcome("Carte C", ["Rien du tout, tu t'en sors bien !"]));
    },
  },
  {
    id: "c5",
    category: "CHOISIS",
    title: "Rouge ou noir",
    prompt: "Devine la couleur d'une carte virtuelle. Bonne réponse : distribue 3. Sinon : bois 2.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "rouge", label: "ROUGE" },
          { key: "noir", label: "NOIR" },
        ]);
      }
      if (!hasSlots(input.randomSlots, "card")) return needRandom("card");
      const drawn = input.randomSlots.card! < 0.5 ? "rouge" : "noir";
      if (input.choiceKey !== drawn) return done(outcome("Perdu", [drinks(activeName, 2)]));
      return done(outcome("Bonne pioche !", ["Distribue 3 gorgées — gérez entre vous."]));
    },
  },
  {
    id: "c6",
    category: "CHOISIS",
    title: "Petit ou gros risque",
    prompt: "Petit risque : distribue 2 ou bois 1. Gros risque : distribue 5 ou bois 4.",
    visualHint: "coin",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "petit", label: "PETIT RISQUE" },
          { key: "gros", label: "GROS RISQUE" },
        ]);
      }
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      const success = flipCoin(input.randomSlots.coin!) === "heads";
      const total = input.choiceKey === "petit" ? 2 : 5;
      const failAmount = input.choiceKey === "petit" ? 1 : 4;
      if (!success) return done(outcome("Risque manqué", [drinks(activeName, failAmount)]));
      return done(outcome("Risque payant !", [`Distribue ${total} gorgées — gérez entre vous.`]));
    },
  },
  {
    id: "c7",
    category: "CHOISIS",
    title: "Moi ou nous",
    prompt: "MOI : tu bois 2 seul. NOUS : tout le monde boit 1, toi inclus.",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "moi", label: "MOI" },
          { key: "nous", label: "NOUS" },
        ]);
      }
      return input.choiceKey === "moi"
        ? done(outcome("Moi", [drinks(activeName, 2)]))
        : done(outcome("Nous", ["Tout le monde boit 1 gorgée, toi inclus."]));
    },
  },
  {
    id: "c8",
    category: "CHOISIS",
    title: "Marché du chaos",
    prompt:
      "Choisis un joueur. Deux effets sont cachés, l'un pour toi et l'autre pour lui. Décide qui reçoit la case A et qui reçoit la case B avant de révéler les effets.",
    visualHint: "mystery",
    resolve(input) {
      const partnerId = input.targetRounds[0]?.[0];
      if (!partnerId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Avec qui traites-tu ?",
        });
      }
      if (!input.choiceKey) {
        return needChoice(
          [
            { key: "a", label: "JE PRENDS A" },
            { key: "b", label: "JE PRENDS B" },
          ],
          "Qui prend quelle case ? Les effets ne sont révélés qu'après.",
        );
      }
      if (!hasSlots(input.randomSlots, "deal")) return needRandom("deal");
      const activeName = playerName(input.players, input.activePlayerId);
      const partnerName = playerName(input.players, partnerId);
      // One box is the good side of the deal, the other the bad one — which
      // letter holds which is only decided once both sides are locked in.
      const goodBox = input.randomSlots.deal! < 0.5 ? "a" : "b";
      const activeTakesGood = input.choiceKey === goodBox;
      const winnerName = activeTakesGood ? activeName : partnerName;
      const loserName = activeTakesGood ? partnerName : activeName;
      return done(
        outcome("Marché du chaos", [
          `Case ${goodBox.toUpperCase()} : distribue 3 gorgées.`,
          `Case ${goodBox === "a" ? "B" : "A"} : bois 3 gorgées.`,
          `${winnerName} distribue 3 gorgées — ${drinks(loserName, 3)}.`,
        ]),
      );
    },
  },
  {
    id: "c9",
    category: "CHOISIS",
    title: "Pacte ou trahison",
    prompt:
      "Choisis un adversaire. Chacun choisit secrètement PACTE ou TRAHISON. Deux pactes : chacun distribue 2. Un seul trahit : il distribue 4 et l'autre boit 2. Deux trahisons : chacun boit 2.",
    visualHint: "none",
    resolve(input) {
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Avec qui scelles-tu le pacte ?",
        });
      }
      const activeName = playerName(input.players, input.activePlayerId);
      const opponentName = playerName(input.players, opponentId);
      return done(
        outcome("Pacte ou trahison", [
          `${activeName} contre ${opponentName}`,
          "Poing fermé = PACTE, main ouverte = TRAHISON. 3, 2, 1 : révélez en même temps.",
          "Deux pactes : chacun distribue 2 gorgées.",
          "Un seul traître : il distribue 4 gorgées, l'autre boit 2 gorgées.",
          "Deux trahisons : chacun boit 2 gorgées.",
        ]),
      );
    },
  },
  {
    id: "c10",
    category: "CHOISIS",
    title: "Vérité ou pénalité",
    prompt:
      "Choisis : répondre honnêtement à une question épicée tirée par l'application, ou garder le silence et boire 2 gorgées.",
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
            { key: "verite", label: "VÉRITÉ" },
            { key: "penalite", label: "PÉNALITÉ" },
          ],
          question,
        );
      }
      const activeName = playerName(input.players, input.activePlayerId);
      return input.choiceKey === "verite"
        ? done(outcome("Vérité", [question, "Réponds honnêtement : tu ne bois rien."]))
        : done(outcome("Pénalité", [drinks(activeName, 2)]));
    },
  },
  {
    id: "c11",
    category: "CHOISIS",
    title: "Bouclier ou attaque",
    prompt:
      "Choisis : distribuer 2 gorgées maintenant, ou gagner un bouclier qui annule jusqu'à 2 gorgées de ta prochaine pénalité avant ton prochain tour.",
    visualHint: "none",
    resolve(input) {
      if (!input.choiceKey) {
        return needChoice([
          { key: "attaque", label: "ATTAQUE" },
          { key: "bouclier", label: "BOUCLIER" },
        ]);
      }
      if (input.choiceKey === "attaque") {
        return done(outcome("Attaque", ["Distribue 2 gorgées — gérez entre vous."]));
      }
      const activeName = playerName(input.players, input.activePlayerId);
      const description = `${activeName} a un bouclier : sa prochaine pénalité est réduite de 2 gorgées maximum, jusqu'à son prochain tour.`;
      return done(
        outcome("Bouclier", [description], "rule"),
        makeRule("c11", "Bouclier", description, input.activePlayerId, "ownerNextTurn"),
      );
    },
  },
  {
    id: "c12",
    category: "CHOISIS",
    title: "Talent ou sécurité",
    prompt:
      "SÉCURITÉ : distribue 2 gorgées. DÉFI : réussis un mini-défi pour en distribuer 5 ; en cas d'échec, bois 2.",
    visualHint: "none",
    resolve(input) {
      if (!input.choiceKey) {
        return needChoice([
          { key: "securite", label: "SÉCURITÉ" },
          { key: "defi", label: "DÉFI" },
        ]);
      }
      if (input.choiceKey === "securite") {
        return done(outcome("Sécurité", ["Distribue 2 gorgées — gérez entre vous."]));
      }
      if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", input.activePlayerId);
      const activeName = playerName(input.players, input.activePlayerId);
      return input.miniGameResult.success
        ? done(outcome("Défi réussi !", ["Distribue 5 gorgées — gérez entre vous."]))
        : done(outcome("Défi manqué", [drinks(activeName, 2)]));
    },
  },
];
