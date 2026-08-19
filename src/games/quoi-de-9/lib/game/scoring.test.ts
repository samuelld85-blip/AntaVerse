import { describe, it, expect } from "vitest";
import { calculateTurnScore, calculateBombPenalty } from "./scoring";

describe("calculateTurnScore (Competition mode)", () => {
  describe("Facile (coefficient 1.0)", () => {
    it("should calculate 100 points per correct answer", () => {
      expect(calculateTurnScore(1, 1)).toBe(100);
      expect(calculateTurnScore(5, 1)).toBe(500);
      expect(calculateTurnScore(9, 1)).toBe(900);
    });

    it("should apply bomb penalty of 200", () => {
      expect(calculateTurnScore(5, 1, true)).toBe(500 - 200); // 300
      expect(calculateTurnScore(0, 1, true)).toBe(0 - 200); // -200
    });
  });

  describe("Moyen (coefficient 1.5)", () => {
    it("should calculate 150 points per correct answer", () => {
      expect(calculateTurnScore(1, 2)).toBe(150);
      expect(calculateTurnScore(5, 2)).toBe(750);
      expect(calculateTurnScore(9, 2)).toBe(1350);
    });

    it("should apply bomb penalty of 300", () => {
      expect(calculateTurnScore(5, 2, true)).toBe(750 - 300); // 450
    });
  });

  describe("Difficile (coefficient 2.0)", () => {
    it("should calculate 200 points per correct answer", () => {
      expect(calculateTurnScore(1, 3)).toBe(200);
      expect(calculateTurnScore(5, 3)).toBe(1000);
      expect(calculateTurnScore(9, 3)).toBe(1800);
    });

    it("should apply bomb penalty of 400", () => {
      expect(calculateTurnScore(5, 3, true)).toBe(1000 - 400); // 600
    });
  });

  describe("Bomb penalties", () => {
    it("should return correct penalties per difficulty", () => {
      expect(calculateBombPenalty(1)).toBe(200); // 2 * 100 * 1.0
      expect(calculateBombPenalty(2)).toBe(300); // 2 * 100 * 1.5
      expect(calculateBombPenalty(3)).toBe(400); // 2 * 100 * 2.0
    });
  });

  describe("Edge cases", () => {
    it("should handle zero correct answers", () => {
      expect(calculateTurnScore(0, 1)).toBe(0);
      expect(calculateTurnScore(0, 2)).toBe(0);
      expect(calculateTurnScore(0, 3)).toBe(0);
    });

    it("should throw for invalid correct answer count", () => {
      expect(() => calculateTurnScore(-1, 1)).toThrow(RangeError);
      expect(() => calculateTurnScore(10, 1)).toThrow(RangeError);
      expect(() => calculateTurnScore(5.5, 1)).toThrow(RangeError);
    });
  });
});
