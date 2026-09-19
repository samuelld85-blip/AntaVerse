import { describe, expect, it } from "vitest";
import { questions } from "./questions";

describe("Qui de nous deux question bank", () => {
  it("contains exactly 230 distinct, playable questions", () => {
    expect(questions).toHaveLength(230);
    expect(new Set(questions.map((question) => question.id)).size).toBe(230);
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(230);
    expect(new Set(questions.map((question) => question.category)).size).toBeGreaterThanOrEqual(5);
    for (const question of questions) expect(question.prompt.length).toBeGreaterThan(20);
  });
});
