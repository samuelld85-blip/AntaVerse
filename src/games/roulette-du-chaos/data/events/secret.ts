import { SECRET_CHALLENGES } from "../content/secret-challenges";
import { hasSlots, needRandom, needTargets, outcome, pickIndexFromSlot, playerName } from "../../lib/game/resolution-helpers";
import type { CategoryId, EventDefinition, ResolveResult } from "../../lib/game/types";

function secretEvent(
  id: string,
  category: CategoryId,
  title: string,
  rewardSips: number,
  owner: "active" | "chosen" | "random",
): EventDefinition {
  return {
    id,
    category,
    title,
    prompt: "Une mission discrète apparaît sur le téléphone. Seul le joueur désigné doit la lire. Ne montre pas l'écran aux autres.",
    visualHint: "mystery",
    weight: 7,
    resolve(input): ResolveResult {
      let ownerId = input.activePlayerId;
      if (owner === "chosen") {
        const chosenId = input.targetRounds[0]?.[0];
        if (!chosenId) return needTargets(1, 1, { excludeIds: [input.activePlayerId], label: "À qui confies-tu la mission ?" });
        ownerId = chosenId;
      }
      if (owner === "random") {
        if (!hasSlots(input.randomSlots, "owner")) return needRandom("owner");
        ownerId = input.players[pickIndexFromSlot(input.randomSlots.owner!, input.players.length)]!.id;
      }
      if (!hasSlots(input.randomSlots, "challenge")) return needRandom("challenge");
      const challenge = SECRET_CHALLENGES[pickIndexFromSlot(input.randomSlots.challenge!, SECRET_CHALLENGES.length)]!;
      if (!input.secretAccepted) {
        return {
          status: "needsInput",
          next: { kind: "secretChallenge", ownerId, challengeId: challenge.id, task: challenge.task, rewardSips },
        };
      }
      const name = playerName(input.players, ownerId);
      return {
        status: "done",
        outcome: outcome("Mission lancée", [
          `${name} garde sa mission pour soi et continue de jouer.`,
          "Réussite non démasquée : révèle la mission et distribue les gorgées indiquées. Si quelqu'un devine la mission avant, elle échoue.",
        ]),
        secretChallenge: { ownerId, challengeId: challenge.id, task: challenge.task, rewardSips },
      };
    },
  };
}

export const secretEvents: EventDefinition[] = [
  secretEvent("sc1", "CHOISIS", "Mission secrète", 3, "active"),
  secretEvent("sc2", "CHOISIS", "Agent double", 3, "chosen"),
  secretEvent("sc3", "DESTIN", "Mission imposée", 3, "random"),
  secretEvent("sc4", "JACKPOT", "Mission royale", 4, "active"),
];
