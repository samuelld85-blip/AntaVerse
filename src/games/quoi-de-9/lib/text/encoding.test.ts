import { z } from "zod";
import { describe, expect, it } from "vitest";
import { questionCollectionSchema } from "@/games/quoi-de-9/lib/game/schemas";
import {
  containsSuspiciousMojibake,
  normalizeText,
  normalizeUnicodeDeep,
  REPRESENTATIVE_FRENCH_STRINGS,
} from "./encoding";

function sampleQuestion(question: string) {
  return {
    id: "geographie-pays-europeens",
    themeId: "geography-world",
    question,
    teaser: "Pays d’Europe",
    difficultyLevel: 1 as const,
    difficultyLabel: "Facile" as const,
    coefficient: 1,
    answers: Array.from({ length: 9 }, (_, index) => ({
      id: `reponse-${index + 1}`,
      display: `Réponse ${index + 1}`,
      normalized: `reponse ${index + 1}`,
      displayOrder: index + 1,
    })),
  };
}

describe("chaîne de texte UTF-8", () => {
  it("préserve les chaînes françaises au chargement, à la validation et à la sérialisation", () => {
    const loaded = normalizeUnicodeDeep(
      JSON.parse(JSON.stringify(REPRESENTATIVE_FRENCH_STRINGS)) as string[],
    );
    const validated = z.array(z.string()).parse(loaded);
    const serializedGameState = JSON.stringify({ questionText: validated });
    const recovered = JSON.parse(serializedGameState) as { questionText: string[] };
    expect(recovered.questionText).toEqual([...REPRESENTATIVE_FRENCH_STRINGS]);
  });

  it("normalise les imports en NFC sans retirer les accents", () => {
    expect(normalizeText("Ge\u0301ographie")).toBe("Géographie");
    expect(normalizeText("Œuvre — l’équipe")).toBe("Œuvre — l’équipe");
  });

  it("signale les motifs de mojibake et les rejette dans le contenu", () => {
    for (const corrupted of [
      "G\u00c3\u00a9ographie",
      "l\u00e2\u20ac\u2122équipe",
      "r\ufffdponses",
    ]) {
      expect(containsSuspiciousMojibake(corrupted)).toBe(true);
    }
    expect(
      questionCollectionSchema.safeParse([
        sampleQuestion("Quels sont les neuf pays d’Europe concernés ?"),
      ]).success,
    ).toBe(true);
    expect(() =>
      questionCollectionSchema.parse([
        sampleQuestion("Quels sont les neuf pays de G\u00c3\u00a9ographie concernés ?"),
      ]),
    ).toThrow(/mojibake/u);
  });
});
