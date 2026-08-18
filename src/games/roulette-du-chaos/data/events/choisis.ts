// CHOISIS — risk vs. reward, decision-making. See spec section 23 (C1-C8).

import {
  done,
  drinks,
  eligibleOthers,
  flipCoin,
  hasSlots,
  needChoice,
  needMiniGame,
  needMystery,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
  receives,
  splitEvenly,
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
      const others = eligibleOthers(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "safe", label: "SAFE" },
          { key: "risk", label: "RISK" },
        ]);
      }
      if (input.choiceKey === "safe") {
        const target = input.targetRounds[0]?.[0];
        if (!target) {
          return needTargets(1, 1, {
            excludeIds: [input.activePlayerId],
            label: "Distribue 1 gorgée à qui ?",
          });
        }
        return done(outcome("Safe", [receives(playerName(input.players, target), 1)]));
      }
      if (!hasSlots(input.randomSlots, "coin")) return needRandom("coin");
      if (flipCoin(input.randomSlots.coin!) !== "heads") {
        return done(outcome("Risk manqué", [drinks(activeName, 3)]));
      }
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(4, others.length), {
          excludeIds: [input.activePlayerId],
          label: "Distribue 4 gorgées",
        });
      }
      const amounts = splitEvenly(4, targets.length);
      const lines = targets.map((id, index) =>
        receives(playerName(input.players, id), amounts[index]!),
      );
      return done(outcome("Risk réussi !", lines));
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
      if (outcomeIndex === 0) {
        const others = eligibleOthers(input.players, input.activePlayerId);
        const targets = input.targetRounds[0];
        if (!targets) {
          return needTargets(1, Math.min(3, others.length), {
            excludeIds: [input.activePlayerId],
            label: "Distribue 3 gorgées",
          });
        }
        const amounts = splitEvenly(3, targets.length);
        return done(
          outcome(
            "Carte A",
            targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          ),
        );
      }
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
      const others = eligibleOthers(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "rouge", label: "ROUGE" },
          { key: "noir", label: "NOIR" },
        ]);
      }
      if (!hasSlots(input.randomSlots, "card")) return needRandom("card");
      const drawn = input.randomSlots.card! < 0.5 ? "rouge" : "noir";
      if (input.choiceKey !== drawn) return done(outcome("Perdu", [drinks(activeName, 2)]));
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(3, others.length), {
          excludeIds: [input.activePlayerId],
          label: "Distribue 3 gorgées",
        });
      }
      const amounts = splitEvenly(3, targets.length);
      return done(
        outcome(
          "Bonne pioche !",
          targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
        ),
      );
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
      const target = input.targetRounds[0]?.[0];
      if (!target) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: `Distribue ${total} gorgées`,
        });
      }
      return done(outcome("Risque payant !", [receives(playerName(input.players, target), total)]));
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
    title: "La boîte",
    prompt: "Trois boîtes mystère : distribue 4, bois 3, ou rien. Choisis-en une.",
    visualHint: "mystery",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      if (!hasSlots(input.randomSlots, "outcome")) return needRandom("outcome");
      if (input.mysteryPickIndex === null) return needMystery(3);
      const outcomeIndex = pickIndexFromSlot(input.randomSlots.outcome!, 3);
      if (outcomeIndex === 0) {
        const others = eligibleOthers(input.players, input.activePlayerId);
        const targets = input.targetRounds[0];
        if (!targets) {
          return needTargets(1, Math.min(4, others.length), {
            excludeIds: [input.activePlayerId],
            label: "Distribue 4 gorgées",
          });
        }
        const amounts = splitEvenly(4, targets.length);
        return done(
          outcome(
            "Boîte gagnante !",
            targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          ),
        );
      }
      if (outcomeIndex === 1) return done(outcome("Boîte piège", [drinks(activeName, 3)]));
      return done(outcome("Boîte vide", ["Rien du tout, tu t'en sors bien !"]));
    },
  },
];
