import type { Route } from "next";

export type GameId = "quoi-de-9" | "la-relance" | "sans-le-dire";

export interface GameDefinition {
  id: GameId;
  name: string;
  description: string;
  route: Route;
  icon: string;
  accent: string;
  iconBackground: string;
}

export const games: readonly GameDefinition[] = [
  {
    id: "quoi-de-9",
    name: "Quoi de 9 ?",
    description: "Essayez de deviner les 9 réponses à la question posée",
    route: "/quoi-de-9",
    icon: "/brand/games/quoi-de-9-dark.png",
    accent: "#16C7E8",
    iconBackground: "#0B1118",
  },
  {
    id: "la-relance",
    name: "La Relance",
    description: "À tour de rôle, trouvez une réponse liée au thème jusqu’à épuisement",
    route: "/la-relance",
    icon: "/brand/games/la-relance-dark.png",
    accent: "#E83DFF",
    iconBackground: "#0B1118",
  },
  {
    id: "sans-le-dire",
    name: "Sans le dire",
    description: "Faites deviner le mot sans prononcer les mots interdits",
    route: "/sans-le-dire",
    icon: "/brand/games/sans-le-dire-dark.png",
    accent: "#16C7E8",
    iconBackground: "#0B1118",
  },
] as const;
