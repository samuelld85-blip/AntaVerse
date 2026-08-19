import { describe, it, expect } from "vitest";
import { calculateFunSips } from "./fun-rewards";

describe("calculateFunSips", () => {
  describe("Facile (Easy) - explicit thresholds", () => {
    it("should return 0 for 0-2 correct answers", () => {
      expect(calculateFunSips(0, 1)).toBe(0);
      expect(calculateFunSips(1, 1)).toBe(0);
      expect(calculateFunSips(2, 1)).toBe(0);
    });

    it("should return 1 for 3-4 correct answers", () => {
      expect(calculateFunSips(3, 1)).toBe(1);
      expect(calculateFunSips(4, 1)).toBe(1);
    });

    it("should return 2 for 5-8 correct answers (special case at 5)", () => {
      expect(calculateFunSips(5, 1)).toBe(2);
      expect(calculateFunSips(6, 1)).toBe(2);
      expect(calculateFunSips(7, 1)).toBe(2);
      expect(calculateFunSips(8, 1)).toBe(2);
    });

    it("should return 3 for 9 correct answers", () => {
      expect(calculateFunSips(9, 1)).toBe(3);
    });
  });

  describe("Moyen (Medium) - floor(correctAnswers / 2)", () => {
    it("should return 0 for 0-1 correct answers", () => {
      expect(calculateFunSips(0, 2)).toBe(0);
      expect(calculateFunSips(1, 2)).toBe(0);
    });

    it("should return 1 for 2-3 correct answers", () => {
      expect(calculateFunSips(2, 2)).toBe(1);
      expect(calculateFunSips(3, 2)).toBe(1);
    });

    it("should return 2 for 4-5 correct answers", () => {
      expect(calculateFunSips(4, 2)).toBe(2);
      expect(calculateFunSips(5, 2)).toBe(2);
    });

    it("should return 3 for 6-7 correct answers", () => {
      expect(calculateFunSips(6, 2)).toBe(3);
      expect(calculateFunSips(7, 2)).toBe(3);
    });

    it("should return 4 for 8-9 correct answers", () => {
      expect(calculateFunSips(8, 2)).toBe(4);
      expect(calculateFunSips(9, 2)).toBe(4);
    });
  });

  describe("Difficile (Hard) - one sip per answer", () => {
    it("should return sips equal to correct answers", () => {
      expect(calculateFunSips(0, 3)).toBe(0);
      expect(calculateFunSips(1, 3)).toBe(1);
      expect(calculateFunSips(5, 3)).toBe(5);
      expect(calculateFunSips(9, 3)).toBe(9);
    });
  });

  describe("Bomb behavior - reduces answers by 2 before conversion", () => {
    describe("Easy with bomb", () => {
      it("should reduce correct answers by 2 before applying threshold", () => {
        expect(calculateFunSips(7, 1, true)).toBe(2); // 7 - 2 = 5 → 2 gorgées
        expect(calculateFunSips(5, 1, true)).toBe(1); // 5 - 2 = 3 → 1 gorgée
        expect(calculateFunSips(4, 1, true)).toBe(0); // 4 - 2 = 2 → 0 gorgées
        expect(calculateFunSips(3, 1, true)).toBe(0); // 3 - 2 = 1 → 0 gorgées
      });

      it("should never produce negative answer count", () => {
        expect(calculateFunSips(0, 1, true)).toBe(0); // max(0, 0 - 2) = 0
        expect(calculateFunSips(1, 1, true)).toBe(0); // max(0, 1 - 2) = 0
      });
    });

    describe("Medium with bomb", () => {
      it("should reduce correct answers by 2 before dividing by 2", () => {
        expect(calculateFunSips(7, 2, true)).toBe(2); // 7 - 2 = 5 → floor(5/2) = 2
        expect(calculateFunSips(5, 2, true)).toBe(1); // 5 - 2 = 3 → floor(3/2) = 1
        expect(calculateFunSips(4, 2, true)).toBe(1); // 4 - 2 = 2 → floor(2/2) = 1
      });
    });

    describe("Hard with bomb", () => {
      it("should reduce correct answers by 2 before returning", () => {
        expect(calculateFunSips(7, 3, true)).toBe(5); // 7 - 2 = 5
        expect(calculateFunSips(5, 3, true)).toBe(3); // 5 - 2 = 3
        expect(calculateFunSips(2, 3, true)).toBe(0); // max(0, 2 - 2) = 0
      });
    });
  });

  describe("Edge cases", () => {
    it("should throw for invalid correct answer count", () => {
      expect(() => calculateFunSips(-1, 1)).toThrow(RangeError);
      expect(() => calculateFunSips(10, 1)).toThrow(RangeError);
      expect(() => calculateFunSips(5.5, 1)).toThrow(RangeError);
    });
  });
});
