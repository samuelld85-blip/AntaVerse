// DUEL — the spec (section 13) describes the category's shape (pick an
// opponent, play a mini-game, clear winner/loser) without enumerating fixed
// events the way the other categories do. These 8 events fill that in: one
// per mini-game, so every mini-game gets a home and the category stays
// varied. Normal loser penalty: 2 gorgées.

import {
  done,
  drinks,
  needMiniGame,
  needTargets,
  outcome,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition, MiniGameKind } from "../../lib/game/types";

function duelEvent(id: string, title: string, prompt: string, kind: MiniGameKind): EventDefinition {
  return {
    id,
    category: "DUEL",
    title,
    prompt,
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
        return needMiniGame(kind, "duel", input.activePlayerId, opponentId);
      }
      const winnerName = playerName(input.players, result.winnerId);
      const loserName = playerName(input.players, result.loserId);
      return done(outcome(title, [`${winnerName} l'emporte !`, drinks(loserName, 2)]));
    },
  };
}

export const duelEvents: EventDefinition[] = [
  duelEvent("dl1", "Duel de réflexes", "Choisis un adversaire pour un duel de réflexes.", "reflex"),
  duelEvent(
    "dl2",
    "Chrono commun",
    "Choisis un adversaire : au plus près de 5 secondes.",
    "stopTimer",
  ),
  duelEvent(
    "dl3",
    "Pierre-feuille-ciseaux",
    "Choisis un adversaire pour un pierre-feuille-ciseaux.",
    "rps",
  ),
  duelEvent(
    "dl4",
    "Plus ou moins",
    "Choisis un adversaire pour un duel plus ou moins.",
    "plusMinus",
  ),
  duelEvent(
    "dl5",
    "Nombre secret",
    "Choisis un adversaire pour deviner le nombre secret.",
    "secretNumber",
  ),
  duelEvent(
    "dl6",
    "Estimation éclair",
    "Choisis un adversaire pour un duel d'estimation.",
    "estimation",
  ),
  duelEvent("dl7", "Tap Battle", "Choisis un adversaire pour un duel de vitesse.", "tapBattle"),
  duelEvent(
    "dl8",
    "Rouge ou noir",
    "Choisis un adversaire pour un face-à-face rouge ou noir.",
    "binaryPrediction",
  ),
];
