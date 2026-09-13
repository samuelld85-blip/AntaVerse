import { describe, expect, it } from "vitest";
import { questions } from "./questions";

describe("Le Pifomètre question bank", () => {
  it("contains a broad, source-backed bank", () => {
    expect(questions.length).toBe(500);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    expect(new Set(questions.map((question) => question.category)).size).toBeGreaterThanOrEqual(50);
  });

  it("keeps every answer usable by the numeric input", () => {
    for (const question of questions) {
      expect(Number.isFinite(question.answer)).toBe(true);
      expect(question.prompt.length).toBeGreaterThan(20);
      expect(question.sourceUrl.startsWith("https://")).toBe(true);
      expect(question.sourceLabel.length).toBeGreaterThan(5);
      expect(question.unit.length).toBeGreaterThan(0);
    }
  });
});
