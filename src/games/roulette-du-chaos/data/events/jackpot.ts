// JACKPOT — rare and meant to feel special. Never punishes with more than the
// group can handle. See spec section 26 (J1-J12).

import {
  DUEL_MINI_GAMES,
  done,
  drinks,
  freeDistributeEvent,
  hasSlots,
  makeRule,
  narratedEvent,
  needChoice,
  needMiniGame,
  needMystery,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

export const jackpotEvents: EventDefinition[] = [
  freeDistributeEvent("j1", "JACKPOT", "Jackpot", "Tu distribues 5 gorgées comme tu veux.", 5),
  freeDistributeEvent(
    "j2",
    "JACKPOT",
    "Super Jackpot",
    "Distribue 6 gorgées entre au moins deux joueurs.",
    6,
  ),
  {
    id: "j3",
    category: "JACKPOT",
    title: "Banco",
    prompt:
      "Distribue 4 gorgées sûres, ou tente le Banco : 8 gorgées si tu réussis, rien si tu échoues.",
    visualHint: "none",
    resolve(input) {
      if (!input.choiceKey) {
        return needChoice([
          { key: "distribuer", label: "DISTRIBUER 4" },
          { key: "banco", label: "TENTER LE BANCO" },
        ]);
      }
      if (input.choiceKey === "distribuer") {
        return done(outcome("Banco", ["Distribue 4 gorgées — gérez entre vous."]));
      }
      if (!input.miniGameResult) return needMiniGame("stopTimer", "solo", input.activePlayerId);
      if (!input.miniGameResult.success)
        return done(outcome("Banco manqué", ["Rien du tout cette fois."]));
      return done(
        outcome("BANCO RÉUSSI !", ["Distribue 8 gorgées — gérez entre vous."], "jackpot"),
      );
    },
  },
  {
    id: "j4",
    category: "JACKPOT",
    title: "Immunité royale",
    prompt:
      "Distribue 4 gorgées et gagne une immunité : avant ton prochain tour, ta prochaine pénalité est réduite de 2 gorgées maximum.",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      const description = `${activeName} est immunisé : sa prochaine pénalité est réduite de 2 gorgées maximum, jusqu'à son prochain tour.`;
      return done(
        outcome(
          "Immunité royale",
          ["Distribue 4 gorgées — gérez entre vous.", description],
          "jackpot",
        ),
        makeRule("j4", "Immunité royale", description, input.activePlayerId, "ownerNextTurn"),
      );
    },
  },
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
      const winnerName = result.winnerId
        ? playerName(input.players, result.winnerId)
        : "Le vainqueur";
      return done(
        outcome(
          "Royal Duel",
          [`${winnerName} remporte le duel ! Distribue 5 gorgées — gérez entre vous.`],
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
      return done(
        outcome("Triple choix", [`Distribue ${total} gorgées — gérez entre vous.`], "jackpot"),
      );
    },
  },
  {
    id: "j8",
    category: "JACKPOT",
    title: "Roi de la roulette",
    prompt:
      "Choisis : distribuer 5 gorgées sûres, ou défier un joueur en Duel Royal. Si tu gagnes, distribue 9 ; si tu perds, bois 4.",
    visualHint: "duel",
    resolve(input) {
      if (!input.choiceKey) {
        return needChoice([
          { key: "distribuer", label: "DISTRIBUER 5" },
          { key: "duel", label: "DUEL ROYAL" },
        ]);
      }
      if (input.choiceKey === "distribuer") {
        return done(outcome("Roi de la roulette", ["Distribue 5 gorgées — gérez entre vous."]));
      }
      const opponentId = input.targetRounds[0]?.[0];
      if (!opponentId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Qui défies-tu ?",
        });
      }
      if (!hasSlots(input.randomSlots, "kind")) return needRandom("kind");
      const kind =
        DUEL_MINI_GAMES[pickIndexFromSlot(input.randomSlots.kind!, DUEL_MINI_GAMES.length)]!;
      const result = input.miniGameResult;
      if (!result || result.tie)
        return needMiniGame(kind, "duel", input.activePlayerId, opponentId);
      const activeName = playerName(input.players, input.activePlayerId);
      return result.winnerId === input.activePlayerId
        ? done(
            outcome(
              "Duel Royal remporté !",
              ["Distribue 9 gorgées — gérez entre vous."],
              "jackpot",
            ),
          )
        : done(outcome("Duel Royal perdu", [drinks(activeName, 4)], "jackpot"));
    },
  },
  narratedEvent(
    "j9",
    "JACKPOT",
    "Le Patron",
    "Distribue 8 gorgées comme tu veux, avec un maximum de 3 par personne.",
    ["Distribue 8 gorgées — maximum 3 par personne. Gérez entre vous."],
  ),
  narratedEvent(
    "j10",
    "JACKPOT",
    "Hold-up collectif",
    "Tous les autres joueurs boivent 1 gorgée. Puis distribue 3 gorgées supplémentaires comme tu veux.",
    [
      "Tous les autres joueurs boivent 1 gorgée.",
      "Puis distribue 3 gorgées supplémentaires — gérez entre vous.",
    ],
  ),
  {
    id: "j11",
    category: "JACKPOT",
    title: "Couronnement",
    prompt:
      "Choisis un co-roi ou une co-reine. Vous distribuez chacun 4 gorgées, sans pouvoir vous cibler l'un l'autre.",
    visualHint: "none",
    resolve(input) {
      const coRulerId = input.targetRounds[0]?.[0];
      if (!coRulerId) {
        return needTargets(1, 1, {
          excludeIds: [input.activePlayerId],
          label: "Qui couronnes-tu ?",
        });
      }
      const activeName = playerName(input.players, input.activePlayerId);
      const coRulerName = playerName(input.players, coRulerId);
      return done(
        outcome(
          "Couronnement",
          [
            `${activeName} et ${coRulerName} règnent ensemble.`,
            "Chacun distribue 4 gorgées — interdiction de se cibler l'un l'autre.",
          ],
          "jackpot",
        ),
      );
    },
  },
  {
    id: "j12",
    category: "JACKPOT",
    title: "Carte blanche",
    prompt:
      "Distribue 4 gorgées puis invente une règle temporaire simple jusqu'à ton prochain tour, dans l'esprit de la catégorie REGLE.",
    visualHint: "none",
    resolve(input) {
      const activeName = playerName(input.players, input.activePlayerId);
      const description = `Règle inventée par ${activeName}, valable jusqu'à son prochain tour. Une gorgée par infraction.`;
      return done(
        outcome(
          "Carte blanche",
          [
            "Distribue 4 gorgées — gérez entre vous.",
            "Annonce maintenant ta règle temporaire, dans l'esprit de la catégorie RÈGLE.",
          ],
          "jackpot",
        ),
        makeRule("j12", "Carte blanche", description, input.activePlayerId, "ownerNextTurn"),
      );
    },
  },
];
