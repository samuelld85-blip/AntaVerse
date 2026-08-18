import { z } from "zod";
import { describe, expect, it } from "vitest";
import rawQuestions from "@/games/quoi-de-9/data/questions.fr.json";
import { questionCollectionSchema } from "@/games/quoi-de-9/lib/game/schemas";
import {
  containsSuspiciousMojibake,
  normalizeText,
  normalizeUnicodeDeep,
  REPRESENTATIVE_FRENCH_STRINGS,
} from "./encoding";

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
    const invalid = structuredClone(rawQuestions[0]!);
    invalid.question = "Quels sont les neuf pays de G\u00c3\u00a9ographie concernés ?";
    expect(() => questionCollectionSchema.parse([invalid])).toThrow(/mojibake/u);
  });
});
