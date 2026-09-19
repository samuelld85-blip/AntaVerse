import { describe, expect, it } from "vitest";
import { questions } from "./questions";

describe("Qui de nous deux question bank", () => {
  it("contains 481 distinct, playable questions", () => {
    expect(questions).toHaveLength(481);
    expect(new Set(questions.map((question) => question.id)).size).toBe(481);
    expect(new Set(questions.map((question) => question.prompt)).size).toBe(481);
    expect(new Set(questions.map((question) => question.category)).size).toBeGreaterThanOrEqual(10);
    for (const question of questions) expect(question.prompt.length).toBeGreaterThan(20);
  });
});
