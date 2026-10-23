import { needChoice, needTargets, outcome, playerName } from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

const OBJECTS = [
  { key: "verre", label: "Un verre" },
  { key: "serviette", label: "Une serviette" },
  { key: "stylo", label: "Un stylo" },
  { key: "autre", label: "Un autre petit objet" },
] as const;

export const cursedObjectEvent: EventDefinition = {
  id: "co1",
  category: "DESTIN",
  title: "L'objet maudit",
  prompt: "Choisissez un petit objet présent sur la table. Il doit changer de mains discrètement avant le compte à rebours.",
  visualHint: "mystery",
  weight: 6,
  resolve(input) {
    if (!input.choiceKey) return needChoice([...OBJECTS], "Quel objet est vraiment sur la table ?");
    const holderId = input.targetRounds[0]?.[0];
    if (!holderId) return needTargets(1, 1, { label: "Qui prend l'objet en premier ?" });
    const objectLabel = OBJECTS.find((object) => object.key === input.choiceKey)?.label ?? "L'objet choisi";
    return {
      status: "done",
      outcome: outcome("L'objet circule !", [
        `${playerName(input.players, holderId)} commence avec ${objectLabel.toLowerCase()}.`,
        "Il faut le passer discrètement. Dans quatre lancers, l'appli demandera qui le possède. Cette personne boira 2 gorgées.",
      ]),
      cursedObject: { objectLabel, startingHolderId: holderId, durationTurns: 4 },
    };
  },
};
