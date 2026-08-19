import type { Route } from "next";

export type GameId =
  | "quoi-de-9"
  | "la-relance"
  | "sans-le-dire"
  | "purple"
  | "triman"
  | "roulette-du-chaos"
  | "palmier";

export interface GameDefinition {
  id: GameId;
  name: string;
  description: string;
  route: Route;
  icon: string;
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
    accent: "#16C7E8",
    iconBackground: "#0B1118",
    modes: ["competition", "fun"],
  },
  {
    id: "la-relance",
    name: "La Relance",
    description: "Trouvez une réponse, relancez… et surtout, ne soyez pas le premier à sécher",
    route: "/la-relance",
    icon: "/brand/games/la-relance-dark.png",
    accent: "#E83DFF",
    iconBackground: "#0B1118",
    modes: ["competition"],
  },
  {
    id: "sans-le-dire",
    name: "Sans le dire",
    description: "Faites deviner le mot sans prononcer les interdits. Plus dur qu'il n'y paraît",
    route: "/sans-le-dire",
    icon: "/brand/games/sans-le-dire-dark.png",
    accent: "#16C7E8",
    iconBackground: "#0B1118",
    modes: ["competition"],
  },
  {
    id: "purple",
    name: "Purple",
    description:
      "Devinez la couleur des cartes, faites grimper le pot… et évitez de le récupérer",
    route: "/purple",
    icon: "/brand/games/purple-dark.png",
    accent: "#8B5CF6",
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "triman",
    name: "Triman",
    description: "Lancez les dés, trouvez le Triman et laissez les gorgées s'enchaîner",
    route: "/triman",
    icon: "/brand/games/triman-dark.png",
    accent: "#FF5C2B",
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
    accent: "#FF4D6D",
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
  {
    id: "palmier",
    name: "Palmier",
    description: "Secouez le palmier, tirez une carte et appliquez sa règle. Gare au quatrième Roi",
    route: "/palmier",
    icon: "/brand/games/palmier-dark.png",
    accent: "#FF7A45",
    iconBackground: "#0B1118",
    drinkingGame: true,
  },
] as const;
