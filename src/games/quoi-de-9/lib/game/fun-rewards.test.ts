import { describe, it, expect } from "vitest";
import { calculateFunSips } from "./fun-rewards";

describe("calculateFunSips", () => {
  describe("Classique — paliers [0,0,0,1,1,2,2,2,3,3]", () => {
    it("retourne 0 pour 0-2 bonnes réponses", () => {
      expect(calculateFunSips(0, 1)).toBe(0);
      expect(calculateFunSips(1, 1)).toBe(0);
      expect(calculateFunSips(2, 1)).toBe(0);
    });

    it("retourne 1 pour 3-4 bonnes réponses", () => {
      expect(calculateFunSips(3, 1)).toBe(1);
      expect(calculateFunSips(4, 1)).toBe(1);
    });

    it("retourne 2 pour 5-7 bonnes réponses", () => {
      expect(calculateFunSips(5, 1)).toBe(2);
      expect(calculateFunSips(6, 1)).toBe(2);
      expect(calculateFunSips(7, 1)).toBe(2);
    });

    it("retourne 3 pour 8-9 bonnes réponses", () => {
      expect(calculateFunSips(8, 1)).toBe(3);
      expect(calculateFunSips(9, 1)).toBe(3);
    });
  });

  describe("Challenge — paliers [0,0,1,1,2,2,3,3,4,4]", () => {
    it("retourne 0 pour 0-1 bonne réponse", () => {
      expect(calculateFunSips(0, 2)).toBe(0);
      expect(calculateFunSips(1, 2)).toBe(0);
    });

    it("retourne 1 pour 2-3 bonnes réponses", () => {
      expect(calculateFunSips(2, 2)).toBe(1);
      expect(calculateFunSips(3, 2)).toBe(1);
    });

    it("retourne 2 pour 4-5 bonnes réponses", () => {
      expect(calculateFunSips(4, 2)).toBe(2);
      expect(calculateFunSips(5, 2)).toBe(2);
    });

    it("retourne 3 pour 6-7 bonnes réponses", () => {
      expect(calculateFunSips(6, 2)).toBe(3);
      expect(calculateFunSips(7, 2)).toBe(3);
    });

    it("retourne 4 pour 8 bonnes réponses", () => {
      expect(calculateFunSips(8, 2)).toBe(4);
    });

    it("retourne 5 pour 9 bonnes réponses (bonus perfect)", () => {
      expect(calculateFunSips(9, 2)).toBe(5);
    });
  });

  describe("Bombe — réduit le compte de 2 avant d'appliquer le palier", () => {
    describe("Classique avec bombe", () => {
      it("réduit le compte de 2 avant le palier", () => {
        expect(calculateFunSips(7, 1, true)).toBe(2); // 7-2=5 → 2
        expect(calculateFunSips(5, 1, true)).toBe(1); // 5-2=3 → 1
        expect(calculateFunSips(4, 1, true)).toBe(0); // 4-2=2 → 0
        expect(calculateFunSips(3, 1, true)).toBe(0); // 3-2=1 → 0
      });

      it("ne produit jamais un compte négatif", () => {
        expect(calculateFunSips(0, 1, true)).toBe(0); // max(0, 0-2)=0
        expect(calculateFunSips(1, 1, true)).toBe(0); // max(0, 1-2)=0
      });
    });

    describe("Challenge avec bombe", () => {
      it("réduit le compte de 2 avant le palier", () => {
        expect(calculateFunSips(7, 2, true)).toBe(2); // 7-2=5 → challenge[5]=2
        expect(calculateFunSips(5, 2, true)).toBe(1); // 5-2=3 → challenge[3]=1
        expect(calculateFunSips(4, 2, true)).toBe(1); // 4-2=2 → challenge[2]=1
        expect(calculateFunSips(9, 2, true)).toBe(3); // 9-2=7 → challenge[7]=3
      });

      it("ne produit jamais un compte négatif", () => {
        expect(calculateFunSips(0, 2, true)).toBe(0);
        expect(calculateFunSips(1, 2, true)).toBe(0);
      });
    });
  });

  describe("Cas limites", () => {
    it("lève une erreur pour un nombre de réponses invalide", () => {
      expect(() => calculateFunSips(-1, 1)).toThrow(RangeError);
      expect(() => calculateFunSips(10, 1)).toThrow(RangeError);
      expect(() => calculateFunSips(5.5, 1)).toThrow(RangeError);
    });
  });
});
