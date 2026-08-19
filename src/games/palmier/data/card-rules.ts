import type { Card, CardValue, Suit } from "../lib/game/types";

export interface CardRuleDefinition {
  title: string;
  body: string;
}

export const CARD_RULES: Record<CardValue, CardRuleDefinition> = {
  "2": {
    title: "Distribue",
    body: "Distribue 4 gorgées comme tu veux.\nTu peux tout donner à une seule personne ou les répartir entre plusieurs.",
  },
  "3": {
    title: "Pour toi",
    body: "Bois 3 gorgées.",
  },
  "4": {
    title: "Front",
    body: "Dès que la carte apparaît, touchez votre front !\nLe dernier à le faire boit 2 gorgées.",
  },
  "5": {
    title: "Maître du pouce",
    body: "Tu es le nouveau Maître du pouce. À tout moment, pose discrètement ton pouce sur la table — tout le monde doit t'imiter. Le dernier à le faire boit 2 gorgées. Ce rôle reste actif jusqu'au prochain 5.",
  },
  "6": {
    title: "Binôme",
    body: "Choisis un partenaire. Jusqu'au prochain 6 : vous êtes liés. Chaque fois que l'un de vous boit, l'autre boit exactement le même nombre de gorgées.",
  },
  "7": {
    title: "Dans ma valise",
    body: "Commence avec « Dans ma valise, il y a… » et nomme un objet. Chaque joueur répète tous les objets dans l'ordre et en ajoute un nouveau. Le premier à oublier, se tromper ou bloquer boit 2 gorgées.",
  },
  "8": {
    title: "Catégorie",
    body: "Choisis une catégorie (marques de voiture, pays, animaux, cocktails…). Chacun doit donner une réponse valide et unique. Le premier à bloquer, répéter ou se tromper boit 2 gorgées.",
  },
  "9": {
    title: "Rime",
    body: "Dis un mot. Chacun doit dire un mot qui rime avec le tien. Le premier à bloquer, répéter ou proposer une rime invalide boit 2 gorgées.",
  },
  "10": {
    title: "Je n'ai jamais",
    body: "Dis « Je n'ai jamais… » suivi de quelque chose que tu n'as jamais fait. Tous ceux qui l'ont fait boivent 1 gorgée.",
  },
  "J": {
    title: "Nouvelle règle",
    body: "Invente une nouvelle règle pour le groupe (ex : interdiction de dire « oui »). Elle reste en vigueur jusqu'à la fin de la partie ou que le groupe en décide autrement.",
  },
  "Q": {
    title: "Maître des questions",
    body: "Tu es le nouveau Maître des questions. Si tu poses une question et que quelqu'un y répond naturellement, cette personne boit 2 gorgées. Ce rôle reste actif jusqu'à la prochaine Dame.",
  },
  "K": {
    title: "Roi du Palmier",
    body: "",
  },
  "A": {
    title: "Cascade",
    body: "Tout le monde boit en cascade. Le joueur actif commence à boire. Le joueur suivant peut s'arrêter uniquement après lui, et ainsi de suite dans l'ordre.",
  },
};

export interface KingRule {
  title: string;
  body: string;
  culSec: boolean;
}

/** Returns the rule text for a King based on how many Kings have now been drawn (1–4). */
export function getKingRule(kingsDrawn: number): KingRule {
  switch (kingsDrawn) {
    case 1:
      return {
        title: "👑 Premier Roi",
        body: "Le palmier commence à bouger.\nBois 1 gorgée.",
        culSec: false,
      };
    case 2:
      return {
        title: "👑 Deuxième Roi",
        body: "Le palmier devient instable.\nBois 2 gorgées.",
        culSec: false,
      };
    case 3:
      return {
        title: "👑 Troisième Roi",
        body: "Le palmier est sur le point de tomber. Il reste un dernier Roi quelque part dans le deck — celui qui le tire fait tomber le palmier.\nBois 3 gorgées.",
        culSec: false,
      };
    case 4:
      return {
        title: "🌴👑 TU AS FAIT TOMBER LE PALMIER",
        body: "CUL SEC !",
        culSec: true,
      };
    default:
      return { title: "Roi du Palmier", body: "", culSec: false };
  }
}

// --- Suit-aware rule lookup -------------------------------------------------
//
// Cards 7 and 9 use the suit colour to vary the social rule, halving the
// number of times each of these games appears in the deck (2 reds + 2 blacks
// instead of 4 identical draws).

const RED_SUITS = new Set<Suit>(["♥", "♦"]);

const RULE_VALISE: CardRuleDefinition = {
  title: "Dans ma valise",
  body: "Commence avec « Dans ma valise, il y a… » et nomme un objet. Chaque joueur répète tous les objets dans l'ordre et en ajoute un nouveau. Le premier à oublier, se tromper ou bloquer boit 2 gorgées.",
};

const RULE_CATEGORIE_7: CardRuleDefinition = {
  title: "Catégorie",
  body: "Choisis oralement une catégorie (pays, marques de voiture, animaux, cocktails…). À tour de rôle, chacun doit donner une réponse valide et unique. Le premier à bloquer, répéter ou se tromper boit 2 gorgées.",
};

const RULE_JAMAIS: CardRuleDefinition = {
  title: "Je n'ai jamais",
  body: "Dis « Je n'ai jamais… » suivi de quelque chose que tu n'as jamais fait. Tous ceux qui l'ont fait boivent 2 gorgées.",
};

const RULE_RIME: CardRuleDefinition = {
  title: "Rime",
  body: "Dis un mot. À tour de rôle, chacun doit dire un mot qui rime. Le premier à bloquer, répéter ou proposer une rime invalide boit 2 gorgées.",
};

/**
 * Returns the rule for a given card, using suit colour for values 7 and 9:
 *   7♥♦ → Dans ma valise   |  7♠♣ → Catégorie
 *   9♥♦ → Je n'ai jamais   |  9♠♣ → Rime
 */
export function getRuleForCard(card: Card): CardRuleDefinition {
  if (card.value === "7") return RED_SUITS.has(card.suit) ? RULE_VALISE : RULE_CATEGORIE_7;
  if (card.value === "9") return RED_SUITS.has(card.suit) ? RULE_JAMAIS : RULE_RIME;
  return CARD_RULES[card.value];
}
