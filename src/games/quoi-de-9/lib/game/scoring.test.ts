import { describe, it, expect } from "vitest";
import { calculateTurnScore, calculateBombPenalty } from "./scoring";

describe("calculateTurnScore (Competition mode)", () => {
  describe("Classique (coefficient 1.0 — 100 pts/réponse)", () => {
    it("calcule 100 points par bonne réponse", () => {
      expect(calculateTurnScore(0, 1)).toBe(0);
      expect(calculateTurnScore(1, 1)).toBe(100);
      expect(calculateTurnScore(5, 1)).toBe(500);
      expect(calculateTurnScore(9, 1)).toBe(900);
    });

    it("applique une pénalité bombe de 200 pts", () => {
      expect(calculateTurnScore(5, 1, true)).toBe(500 - 200); // 300
      expect(calculateTurnScore(0, 1, true)).toBe(0 - 200); // -200
    });
  });

  describe("Challenge (coefficient 1.35 — 135 pts/réponse)", () => {
    it("calcule 135 points par bonne réponse", () => {
      expect(calculateTurnScore(0, 2)).toBe(0);
      expect(calculateTurnScore(1, 2)).toBe(135);
      expect(calculateTurnScore(5, 2)).toBe(675);
      expect(calculateTurnScore(6, 2)).toBe(810);
      expect(calculateTurnScore(9, 2)).toBe(1215);
    });

    it("applique une pénalité bombe de 270 pts", () => {
      expect(calculateTurnScore(5, 2, true)).toBe(675 - 270); // 405
    });
  });

  describe("Pénalités bombe", () => {
    it("retourne la pénalité correcte par niveau", () => {
      expect(calculateBombPenalty(1)).toBe(200); // 2 * 100 * 1.0
      expect(calculateBombPenalty(2)).toBe(270); // 2 * 100 * 1.35
    });
  });

  describe("Cas limites", () => {
    it("retourne 0 pour 0 bonne réponse (sans bombe)", () => {
      expect(calculateTurnScore(0, 1)).toBe(0);
      expect(calculateTurnScore(0, 2)).toBe(0);
    });

    it("lève une erreur pour un nombre de réponses invalide", () => {
      expect(() => calculateTurnScore(-1, 1)).toThrow(RangeError);
      expect(() => calculateTurnScore(10, 1)).toThrow(RangeError);
      expect(() => calculateTurnScore(5.5, 1)).toThrow(RangeError);
    });
  });
});
