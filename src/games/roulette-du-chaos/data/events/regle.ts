// RÈGLE — constraints that overlap for several laps of the table.

import { FORBIDDEN_WORDS } from "../content/forbidden-words";
import { VOICE_STYLES } from "../content/voice-styles";
import {
  done,
  hasSlots,
  makeRule,
  needRandom,
  needTargets,
  outcome,
  pickIndexFromSlot,
  playerName,
} from "../../lib/game/resolution-helpers";
import type { EventDefinition } from "../../lib/game/types";

function ruleEvent(
  id: string,
  title: string,
  prompt: string,
  description: string,
  expiry: "ownerNextTurn" | "firstViolation" | "timer" | "turns",
  timerMs: number | null = null,
  rounds: 3 | 4 = 3,
): EventDefinition {
  return {
    id,
    category: "REGLE",
    title,
    prompt,
    visualHint: "none",
    resolve(input) {
      const rule = makeRule(
        id,
        title,
        description,
        input.activePlayerId,
        expiry === "ownerNextTurn" ? "turns" : expiry,
        timerMs,
        input.players.length * rounds,
      );
      if (id === "r1" || id === "r4" || id === "r33") rule.conflictGroup = "names";
      return done(outcome(title, [description], "rule"), rule);
    },
  };
}

function absurdRule(
  id: string,
  title: string,
  instruction: string,
  rounds: 3 | 4 = 3,
): EventDefinition {
  return ruleEvent(
    id,
    title,
    `Pendant ${rounds} tours de table : ${instruction}`,
    instruction,
    "turns",
    null,
    rounds,
  );
}

export const regleEvents: EventDefinition[] = [
  ruleEvent(
    "r1",
    "Plus de prénom",
    "Pendant 4 tours de table, personne ne peut dire le prénom d'un autre joueur.",
    "Interdiction de dire le prénom d'un autre joueur. Une gorgée par infraction.",
    "ownerNextTurn",
    null,
    4,
  ),
  ruleEvent(
    "r2",
    "Oui / Non",
    "Pendant 4 tours de table, les mots « oui » et « non » sont interdits.",
    "Mots interdits : « oui » et « non ». Une gorgée par infraction.",
    "ownerNextTurn",
    null,
    4,
  ),
  ruleEvent(
    "r3",
    "Interdit de montrer",
    "Pendant 3 tours de table, pointer quelqu'un du doigt est interdit. Chaque infraction coûte 1 gorgée.",
    "Interdiction de pointer quelqu'un du doigt. Chaque infraction coûte 1 gorgée.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r4",
    "Monsieur / Madame",
    "Pendant 3 tours de table, on s'adresse aux autres en disant « Monsieur » ou « Madame ».",
    "S'adresser aux autres par « Monsieur » ou « Madame ». Une gorgée par infraction.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r5",
    "Pas de gros mot",
    "Pendant 3 tours de table : pas de gros mot. Chaque oubli coûte 1 gorgée.",
    "Chaque gros mot entendu coûte 1 gorgée à la personne qui l'a dit.",
    "turns",
  ),
  {
    id: "r6",
    category: "REGLE",
    title: "Mot interdit",
    prompt:
      "Un mot est tiré au sort. Le premier qui le prononce boit 1 gorgée, puis la règle se termine.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "word")) return needRandom("word");
      const word =
        FORBIDDEN_WORDS[pickIndexFromSlot(input.randomSlots.word!, FORBIDDEN_WORDS.length)]!;
      const description = `Mot interdit : "${word}". Le premier à le dire boit 1 gorgée, puis la règle se termine.`;
      const rule = makeRule(
        "r6",
        "Mot interdit",
        description,
        input.activePlayerId,
        "firstViolation",
        null,
        input.players.length * 3,
      );
      return done(outcome("Mot interdit", [description], "rule"), rule);
    },
  },
  ruleEvent(
    "r7",
    "Question interdite",
    "Pendant 3 tours de table, répondre directement à une question posée coûte 1 gorgée.",
    "Répondre directement à une question posée coûte 1 gorgée à celui qui répond.",
    "ownerNextTurn",
  ),
  ruleEvent(
    "r8",
    "Téléphone interdit",
    "Pendant 3 tours de table, personne ne touche à son téléphone personnel. La première infraction coûte 1 gorgée.",
    "Personne ne touche à son téléphone personnel. La première infraction coûte 1 gorgée, puis la règle se termine.",
    "firstViolation",
  ),
  {
    id: "r9",
    category: "REGLE",
    title: "Voix imposée",
    prompt:
      "L'application tire une manière de parler simple (chuchoter, voix de robot, présentateur TV...). La première personne qui oublie boit 1.",
    visualHint: "none",
    resolve(input) {
      if (!hasSlots(input.randomSlots, "style")) return needRandom("style");
      const style = VOICE_STYLES[pickIndexFromSlot(input.randomSlots.style!, VOICE_STYLES.length)]!;
      const description = `Tout le monde doit ${style}. La première personne qui oublie boit 1 gorgée, puis la règle se termine.`;
      return done(
        outcome("Voix imposée", [description], "rule"),
        makeRule(
          "r9",
          "Voix imposée",
          description,
          input.activePlayerId,
          "firstViolation",
          null,
          input.players.length * 3,
        ),
      );
    },
  },
  ruleEvent(
    "r10",
    "Pouce discret",
    "Pendant 3 tours de table, pose discrètement ton pouce sur la table quand tu veux. Tous doivent t'imiter : le dernier boit 2. La règle se termine aussitôt.",
    "Quand le propriétaire de la règle pose discrètement son pouce sur la table, tous doivent l'imiter. Le dernier boit 2 gorgées, puis la règle se termine.",
    "firstViolation",
  ),
  ruleEvent(
    "r11",
    "Pas de « je »",
    "Pendant 4 tours de table, « je » et « j' » sont interdits. Chaque infraction coûte 1 gorgée.",
    "Mots interdits : « je » et « j' ». Chaque infraction coûte 1 gorgée.",
    "ownerNextTurn",
    null,
    4,
  ),
  ruleEvent(
    "r12",
    "Signal secret",
    "Pendant 3 tours de table, touche discrètement ton nez ou ton oreille. Tous doivent reproduire le geste : le dernier boit 2. La règle se termine aussitôt.",
    "Quand le propriétaire de la règle touche discrètement son nez ou son oreille, tous doivent reproduire le geste. Le dernier boit 2 gorgées, puis la règle se termine.",
    "firstViolation",
  ),
  absurdRule(
    "r13",
    "Chef",
    "Chaque phrase doit finir par « chef ». Une gorgée si quelqu'un oublie.",
  ),
  absurdRule(
    "r14",
    "Selon mes sources",
    "Avant d'affirmer quelque chose, commence par « selon mes sources ». Une gorgée si tu oublies.",
  ),
  absurdRule(
    "r15",
    "Troisième personne",
    "Chacun parle de soi à la troisième personne. Une gorgée à chaque oubli.",
  ),
  absurdRule(
    "r16",
    "La main levée",
    "Il faut lever la main avant de parler. Une gorgée pour une intervention clandestine.",
    4,
  ),
  absurdRule(
    "r17",
    "Chiffres interdits",
    "Hors chiffres demandés par un mini-jeu, prononcer un nombre coûte une gorgée.",
  ),
  absurdRule(
    "r18",
    "Trois mots max",
    "Chaque intervention tient en trois mots maximum. Une gorgée au quatrième mot.",
  ),
  absurdRule(
    "r19",
    "Le mot de passe",
    "Avant de tourner la roue, le joueur actif doit dire « mouette cosmique ». Sinon, une gorgée.",
    4,
  ),
  absurdRule(
    "r20",
    "Bonjour la question",
    "Avant de poser une question, salue la personne interrogée. Une gorgée si tu oublies.",
  ),
  absurdRule(
    "r21",
    "Objection",
    "Pour contredire quelqu'un, commence par « objection, votre honneur ! ». Une gorgée si tu oublies.",
    4,
  ),
  absurdRule(
    "r22",
    "Pas de « du coup »",
    "« Du coup » est interdit. Une gorgée à chaque oubli.",
    4,
  ),
  absurdRule(
    "r23",
    "Le présentateur",
    "Avant son lancer, le joueur actif présente le prochain joueur comme à la télévision. Une gorgée s'il oublie.",
  ),
  absurdRule(
    "r24",
    "Coin coin",
    "Quand une gorgée est attribuée, tout le monde doit dire « coin coin ». Le dernier qui réagit boit une gorgée.",
  ),
  absurdRule(
    "r25",
    "Autocompliment",
    "Avant son lancer, chaque joueur doit se complimenter à voix haute. Une gorgée si le lancer part trop vite.",
    4,
  ),
  absurdRule(
    "r26",
    "Voix off",
    "À chaque résultat, le joueur actif doit annoncer « précédemment dans La Roulette du Chaos… ». Une gorgée s'il oublie.",
  ),
  absurdRule(
    "r27",
    "Mains sur la table",
    "Au début de chaque lancer, tous posent une main sur la table. Le dernier à réagir boit une gorgée.",
  ),
  absurdRule(
    "r28",
    "Sans le mot « boire »",
    "« Boire », « bois » et « gorgée » sont interdits à l'oral. Une gorgée à chaque oubli.",
    4,
  ),
  absurdRule(
    "r29",
    "Applaudissement",
    "Après chaque duel, tout le monde applaudit le perdant. Le premier qui oublie boit une gorgée.",
  ),
  absurdRule(
    "r30",
    "Le faux expert",
    "Quand quelqu'un explique une règle, il commence par « en tant qu'expert ». Une gorgée s'il oublie.",
  ),
  absurdRule(
    "r31",
    "Pas de « tu »",
    "« Tu » et « toi » sont interdits. Une gorgée à chaque oubli.",
  ),
  absurdRule(
    "r32",
    "Merci patron",
    "Quand quelqu'un distribue des gorgées, sa cible répond « merci patron ». Une gorgée si elle oublie.",
    4,
  ),
  absurdRule(
    "r33",
    "Mon avocat",
    "Chacun doit appeler son voisin de gauche « mon avocat ». Une gorgée si son vrai prénom sort.",
    4,
  ),
  absurdRule(
    "r34",
    "Touche la table",
    "Avant de boire une gorgée, il faut toucher la table. Une gorgée supplémentaire si quelqu'un oublie.",
  ),
  {
    id: "r35",
    category: "REGLE",
    title: "Échange d'identités",
    prompt:
      "Choisis deux joueurs : pendant trois tours de table, ils portent le prénom de l'autre.",
    visualHint: "none",
    weight: 6,
    resolve(input) {
      const pair = input.targetRounds[0];
      if (!pair || pair.length !== 2)
        return needTargets(2, 2, { label: "Quels deux joueurs échangent leurs prénoms ?" });
      const [firstId, secondId] = pair as [string, string];
      const firstName = playerName(input.players, firstId);
      const secondName = playerName(input.players, secondId);
      const description = `${firstName} s'appelle désormais ${secondName}, et ${secondName} s'appelle ${firstName}. Une gorgée si quelqu'un utilise le mauvais prénom.`;
      return done(outcome("Identités échangées", [description], "rule"), {
        ...makeRule(
          "r35",
          "Échange d'identités",
          description,
          input.activePlayerId,
          "turns",
          null,
          input.players.length * 3,
        ),
        conflictGroup: "names",
        identitySwap: [firstId, secondId],
      });
    },
  },
];
