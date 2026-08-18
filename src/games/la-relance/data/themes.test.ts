import { describe, expect, it } from "vitest";
import { themes } from "./themes";

describe("banque de thèmes", () => {
  it("contient la sélection finale sans doublons", () => {
    expect(themes).toHaveLength(194);
    expect(new Set(themes.map((theme) => theme.id))).toHaveLength(themes.length);
    expect(new Set(themes.map((theme) => theme.label))).toHaveLength(themes.length);
  });

  it("garde les thèmes simples validés et retire les catégories trop larges", () => {
    const ids = new Set(themes.map((theme) => theme.id));

    for (const id of ["fruits", "legumes", "sports"]) {
      expect(ids.has(id)).toBe(true);
    }
    expect(ids).not.toContain("animaux");
  });

  it("inclut les nouveaux thèmes adultes et étudiants", () => {
    const ids = new Set(themes.map((theme) => theme.id));

    for (const id of [
      "positions-sexuelles",
      "drogues-connues",
      "ecoles-de-commerce-francaises",
      "evenements-classiques-dun-bde",
      "choses-quon-trouve-dans-un-week-end-dintegration",
      "jeux-a-boire-connus",
      "cocktails-quon-commande-en-soiree",
      "alcools-quon-boit-en-shot",
      "festivals-de-musique-francais",
      "dj-connus",
      "boites-de-nuit-connues-a-paris",
      "villes-etudiantes-francaises",
    ]) {
      expect(ids.has(id)).toBe(true);
    }
  });
});
