// JACKPOT — rare (4% weight) and meant to feel special. Never punishes with
// more than the group can handle. See spec section 26 (J1-J8).

import {
  DUEL_MINI_GAMES,
  done,
  drinks,
  eligibleOthers,
  freeDistributeEvent,
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

export const jackpotEvents: EventDefinition[] = [
  freeDistributeEvent("j1", "JACKPOT", "Jackpot", "Tu distribues 5 gorgées comme tu veux.", 5, 5),
  freeDistributeEvent(
    "j2",
    "JACKPOT",
    "Super Jackpot",
    "Distribue 6 gorgées entre au moins deux joueurs.",
    6,
    6,
    2,
  ),
  {
    id: "j3",
    category: "JACKPOT",
    title: "Banco",
    prompt:
      "Distribue 4 gorgées sûres, ou tente le Banco : 8 gorgées si tu réussis, rien si tu échoues.",
    visualHint: "none",
    resolve(input) {
      const others = eligibleOthers(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "distribuer", label: "DISTRIBUER 4" },
          { key: "banco", label: "TENTER LE BANCO" },
        ]);
      }
      if (input.choiceKey === "distribuer") {
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
            "Banco",
            targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          ),
        );
      }
      if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", input.activePlayerId);
      if (!input.miniGameResult.success)
        return done(outcome("Banco manqué", ["Rien du tout cette fois."]));
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(8, others.length), {
          excludeIds: [input.activePlayerId],
          label: "Banco réussi : distribue 8 gorgées",
        });
      }
      const amounts = splitEvenly(8, targets.length);
      return done(
        outcome(
          "BANCO RÉUSSI !",
          targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          "jackpot",
        ),
      );
    },
  },
  freeDistributeEvent(
    "j4",
    "JACKPOT",
    "Jackpot gratuit",
    "Tu ne bois rien. En plus, distribue 3 gorgées.",
    3,
    3,
  ),
  {
    id: "j5",
    category: "JACKPOT",
    title: "Royal Duel",
    prompt: "Choisis un adversaire. Le vainqueur distribue 5 gorgées comme il le souhaite.",
    visualHint: "duel",
    resolve(input) {
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Choisis ton adversaire",
        });
      }
      if (!hasSlots(input.randomSlots, "kind")) return needRandom("kind");
      const kind =
        DUEL_MINI_GAMES[pickIndexFromSlot(input.randomSlots.kind!, DUEL_MINI_GAMES.length)]!;
      const result = input.miniGameResult;
      if (!result || result.tie)
        return needMiniGame(kind, "duel", input.activePlayerId, opponentId);
      const winnerId = result.winnerId!;
      const pool = input.players.filter((player) => player.id !== winnerId);
      const recipients = input.targetRounds[1];
      if (!recipients) {
        return needTargets(1, Math.min(5, pool.length), {
          excludeIds: [winnerId],
          label: `${playerName(input.players, winnerId)} distribue 5 gorgées`,
        });
      }
      const amounts = splitEvenly(5, recipients.length);
      return done(
        outcome(
          "Royal Duel",
          [
            `${playerName(input.players, winnerId)} remporte le duel !`,
            ...recipients.map((id, index) =>
              receives(playerName(input.players, id), amounts[index]!),
            ),
          ],
          "jackpot",
        ),
      );
    },
  },
  freeDistributeEvent(
    "j6",
    "JACKPOT",
    "Braquage",
    "Choisis trois cibles : elles reçoivent 2, 2 et 1 gorgée(s).",
    5,
    3,
    3,
  ),
  {
    id: "j7",
    category: "JACKPOT",
    title: "Triple choix",
    prompt: "Trois cartes cachées : distribue 7, distribue 4, ou rien. Choisis-en une.",
    visualHint: "mystery",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "outcome")) return needRandom("outcome");
      if (input.mysteryPickIndex === null) return needMystery(3);
      const outcomeIndex = pickIndexFromSlot(input.randomSlots.outcome!, 3);
      const total = outcomeIndex === 0 ? 7 : outcomeIndex === 1 ? 4 : 0;
      if (total === 0) return done(outcome("Triple choix", ["Rien du tout, tu t'en sors bien !"]));
      const others = eligibleOthers(input.players, input.activePlayerId);
      const targets = input.targetRounds[0];
      if (!targets) {
        return needTargets(1, Math.min(total, others.length), {
          excludeIds: [input.activePlayerId],
          label: `Distribue ${total} gorgées`,
        });
      }
      const amounts = splitEvenly(total, targets.length);
      return done(
        outcome(
          "Triple choix",
          targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          "jackpot",
        ),
      );
    },
  },
  {
    id: "j8",
    category: "JACKPOT",
    title: "Roi de la roulette",
    prompt: "Distribue 5 gorgées sûres, ou lance un Duel Royal : le perdant boit 4 gorgées.",
    visualHint: "duel",
    resolve(input) {
      const others = eligibleOthers(input.players, input.activePlayerId);
      if (!input.choiceKey) {
        return needChoice([
          { key: "distribuer", label: "DISTRIBUER 5" },
          { key: "duel", label: "DUEL ROYAL" },
        ]);
      }
      if (input.choiceKey === "distribuer") {
        const targets = input.targetRounds[0];
        if (!targets) {
          return needTargets(1, Math.min(5, others.length), {
            excludeIds: [input.activePlayerId],
            label: "Distribue 5 gorgées",
          });
        }
        const amounts = splitEvenly(5, targets.length);
        return done(
          outcome(
            "Roi de la roulette",
            targets.map((id, index) => receives(playerName(input.players, id), amounts[index]!)),
          ),
        );
      }
      const duelists = input.targetRounds[0];
      const count = Math.min(2, others.length);
      if (!duelists) {
        return needTargets(count, count, {
          excludeIds: [input.activePlayerId],
          label: "Choisis deux duellistes",
        });
      }
      if (!hasSlots(input.randomSlots, "kind")) return needRandom("kind");
      const kind =
        DUEL_MINI_GAMES[pickIndexFromSlot(input.randomSlots.kind!, DUEL_MINI_GAMES.length)]!;
      const result = input.miniGameResult;
      if (!result || result.tie)
        return needMiniGame(kind, "duel", duelists[0]!, duelists[1] ?? duelists[0]!);
      return done(
        outcome("Duel Royal", [drinks(playerName(input.players, result.loserId), 4)], "jackpot"),
      );
    },
  },
];
