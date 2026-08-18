import { describe, expect, it } from "vitest";
import rawBundle from "@/games/quoi-de-9/generated/content-bundle.json";
import reviewBundle from "@/games/quoi-de-9/generated/content-review-bundle.json";
import { questions, themes } from "@/games/quoi-de-9/data/questions";
import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS } from "./config";
import { getThemeAvailability } from "./engine";
import { questionCollectionSchema } from "./schemas";
import { findSuspiciousMojibake } from "@/games/quoi-de-9/lib/text/encoding";

describe("curated content", () => {
  it("defines all 24 themes and only enables themes with complete published coverage", () => {
    expect(themes).toHaveLength(24);
    const availability = getThemeAvailability(themes, questions, []);
    const playable = availability.filter((entry) => entry.available);
    expect(playable).toHaveLength(24);
    for (const entry of playable) {
      for (const difficultyLevel of DIFFICULTY_LEVELS) {
        expect(entry.byDifficulty[difficultyLevel]).toBeGreaterThan(0);
      }
    }
  });

  it("excludes every unpublished record from the offline game bundle", () => {
    expect(rawBundle.questions.every((question) => question.status === "published")).toBe(true);
    const unpublishedIds = new Set(
      reviewBundle.questions
        .filter((question) => question.status !== "published")
        .map((question) => question.id),
    );
    expect(questions.some((question) => unpublishedIds.has(question.id))).toBe(false);
  });

  it("uses numeric difficulty as the authoritative value", () => {
    for (const question of questions) {
      expect(DIFFICULTY_LEVELS).toContain(question.difficultyLevel);
      expect(question.difficultyLabel).toBe(DIFFICULTY_LABELS[question.difficultyLevel]);
    }
  });

  it("validates exactly nine distinct answers for every published question", () => {
    expect(() => questionCollectionSchema.parse(questions)).not.toThrow();
    for (const question of questions) {
      expect(question.answers).toHaveLength(9);
      expect(new Set(question.answers.map((answer) => answer.normalized)).size).toBe(9);
    }
  });

  it("defines one distinct bomb for every published question", () => {
    for (const question of questions) {
      expect(question.bomb.id).toBe(`${question.id}-bomb`);
      expect(question.bomb.explanation.length).toBeGreaterThanOrEqual(12);
      const accepted = new Set(
        question.answers.flatMap((answer) => [answer.normalized, ...answer.alternatives]),
      );
      expect(accepted.has(question.bomb.normalized)).toBe(false);
      expect(question.bomb.alternatives.some((value) => accepted.has(value))).toBe(false);
    }
  });

  it("starts every displayed answer with a capital letter", () => {
    for (const question of questions) {
      for (const answer of question.answers) {
        const firstCharacter = Array.from(answer.display)[0];
        expect(firstCharacter).toBe(firstCharacter?.toLocaleUpperCase("fr-FR"));
      }
    }
  });

  it("rejects an imported question with fewer than nine answers", () => {
    const source = questions[0];
    if (!source) throw new Error("Le catalogue de test est vide");
    const invalid = structuredClone(source);
    invalid.answers = invalid.answers.slice(0, 8);
    expect(() => questionCollectionSchema.parse([invalid])).toThrow();
  });

  it("keeps the published catalogue entirely in French", () => {
    for (const question of questions) {
      expect(question.language).toBe("fr");
      expect(findSuspiciousMojibake(question.question)).toEqual([]);
    }
  });
});
