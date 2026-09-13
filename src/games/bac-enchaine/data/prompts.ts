export interface BacPrompt {
  category: string;
  letter: string;
  kind: "classic" | "fun";
}

type PromptDefinition = readonly [category: string, letters: string, kind: BacPrompt["kind"]];

// The letters are intentionally curated per category. Rare letters and
// combinations with too few natural answers are left out, while the pool is
// deliberately much larger than one party needs. A game uses only eight
// different categories, so the same bank can support many sessions.
const PROMPT_DEFINITIONS: readonly PromptDefinition[] = [
  ["Animal", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Métier", "ABCDEFGHILMNOPRSTV", "classic"],
  ["Prénom", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Nourriture", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Boisson", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Objet", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Ville ou pays", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Marque", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Film ou série", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Personnage célèbre", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Plante ou fleur", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Vêtement", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Sport", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Véhicule", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Fruit ou légume", "ABCDEFGHILMNOPRSTV", "classic"],
  ["Instrument de musique", "ABCDEFGHILMNOPRSTV", "classic"],
  ["Lieu", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Jeu vidéo", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Livre ou BD", "ABCDEFGHIJLMNOPRSTV", "classic"],
  ["Application ou réseau social", "ABCDEFGHILMNOPRSTV", "classic"],
  ["Matière ou matériau", "ABCDEFGHILMNOPRSTV", "classic"],
  ["Chose qu’on trouve à une soirée", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Excuse", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Cadeau", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Chose qui fait peur", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Mauvaise idée", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Truc qu’on peut oublier", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Surnom", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Mot qu’on ne veut pas entendre en vacances", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Chose qu’on peut casser", "ABCDEFGHLMNOPRSTV", "fun"],
  ["Chose qu’on peut dire au lit", "ABCDEFGHLMNOPRSTV", "fun"],
];

export const BAC_PROMPTS: readonly BacPrompt[] = PROMPT_DEFINITIONS.flatMap(
  ([category, letters, kind]) => [...letters].map((letter) => ({ category, letter, kind })),
);
