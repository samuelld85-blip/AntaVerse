import type { Route } from "next";
import {
  LA_RELANCE_ACCENT,
  PALMIER_ACCENT,
  PURPLE_ACCENT,
  QUOI_DE_9_ACCENT,
  ROULETTE_DU_CHAOS_ACCENT,
  SANS_LE_DIRE_ACCENT,
  TRIMAN_ACCENT,
  FUCK_ACCENT,
  LA_TRAVERSEE_ACCENT,
} from "@/games/shared/lib/launcher-accents";

export type GameId =
  | "quoi-de-9"
  | "la-relance"
  | "sans-le-dire"
  | "purple"
  | "triman"
  | "roulette-du-chaos"
  | "palmier"
  | "fuck"
  | "la-traversee";

export interface GameDefinition {
  id: GameId;
  name: string;
  description: string;
  route: Route;
  icon: string;
  iconLight?: string;
  accent: string;
  iconBackground: string;
  drinkingGame?: boolean;
  modes?: ("competition" | "fun")[];
}

export const games: readonly GameDefinition[] = [
  {
    id: "quoi-de-9",
    name: "Quoi de 9 ?",
    description: "Trouvez les 9 bonnes réponses avant que le temps ne vous rattrape",
    route: "/quoi-de-9",
    icon: "/brand/games/quoi-de-9-dark.png",
    iconLight: "/brand/games/quoi-de-9-light.png",
    accent: QUOI_DE_9_ACCENT,
    iconBackground: "#0B1118",
    modes: ["competition", "fun"],
  },
  {
    id: "la-relance",
    name: "La Relance",
    description: "Trouvez une réponse, relancez… et surtout, ne soyez pas le premier à sécher",
    route: "/la-relance",
    icon: "/brand/games/la-relance-dark.png",
    iconLight: "/brand/games/la-relance-light.png",
    accent: LA_RELANCE_ACCENT,
    iconBackground: "#0B1118",
    modes: ["competition"],
  },
  {
    id: "sans-le-dire",
    name: "Sans le dire",
    description: "Faites deviner le mot sans prononcer les interdits. Plus dur qu'il n'y paraît",
    route: "/sans-le-dire",
    icon: "/brand/games/sans-le-dire-dark.png",
    iconLight: "/brand/games/sans-le-dire-light.png",
    accent: SANS_LE_DIRE_ACCENT,
    iconBackground: "#0B1118",
    modes: ["competition", "fun"],
  },
  {
    id: "purple",
    name: "Purple",
    description:
      "Devinez la couleur des cartes, faites grimper le pot… et évitez de le récupérer",
    route: "/purple",
    icon: "/brand/games/purple-dark.png",
    iconLight: "/brand/games/purple-light.png",
    accent: PURPLE_ACCENT,
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "triman",
    name: "Triman",
    description: "Lancez les dés, trouvez le Triman et laissez les gorgées s'enchaîner",
    route: "/triman",
    icon: "/brand/games/triman-dark.png",
    iconLight: "/brand/games/triman-light.png",
    accent: TRIMAN_ACCENT,
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "roulette-du-chaos",
    name: "Roulette du Chaos",
    description:
      "Faites tourner la roue : défis, duels, gorgées et coups du destin.",
    route: "/roulette-du-chaos",
    icon: "/brand/games/roulette-du-chaos-dark.png",
    iconLight: "/brand/games/roulette-du-chaos-light.png",
    accent: ROULETTE_DU_CHAOS_ACCENT,
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "palmier",
    name: "Palmier",
    description: "Secouez le palmier, tirez une carte et appliquez sa règle. Gare au quatrième Roi",
    route: "/palmier",
    icon: "/brand/games/palmier-dark.png",
    iconLight: "/brand/games/palmier-light.png",
    accent: PALMIER_ACCENT,
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "fuck",
    name: "Fuck",
    description: "Devinez la carte, tenez trois manches et ne vous faites pas voler le rôle de Dealer",
    route: "/fuck",
    icon: "/brand/games/fuck-dark.png",
    iconLight: "/brand/games/fuck-light.png",
    accent: FUCK_ACCENT,
    iconBackground: "#062d20",
    drinkingGame: true,
  },
  {
    id: "la-traversee",
    name: "La Traversée",
    description: "Choisissez votre ligne, annoncez plus ou moins et tentez d’atteindre l’autre côté",
    route: "/la-traversee",
    icon: "/brand/games/la-traversee-dark.png",
    iconLight: "/brand/games/la-traversee-light.png",
    accent: LA_TRAVERSEE_ACCENT,
    iconBackground: "#061a33",
    drinkingGame: true,
  },
] as const;
