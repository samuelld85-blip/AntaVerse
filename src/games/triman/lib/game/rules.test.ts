import { describe, expect, it } from "vitest";
import { evaluateActiveRoll, isTrimanRoll } from "./rules";
import type { Player } from "./types";

const players: Player[] = [
  { id: "p0", name: "Samuel" },
  { id: "p1", name: "Emma" },
  { id: "p2", name: "Lucas" },
  { id: "p3", name: "Chloé" },
];

describe("isTrimanRoll", () => {
  it("is true whenever a die shows 3", () => {
    expect(isTrimanRoll({ a: 3, b: 1 })).toBe(true);
    expect(isTrimanRoll({ a: 5, b: 3 })).toBe(true);
    expect(isTrimanRoll({ a: 3, b: 3 })).toBe(true);
    expect(isTrimanRoll({ a: 3, b: 6 })).toBe(true);
  });

  it("is true for 1+2 in either order", () => {
    expect(isTrimanRoll({ a: 1, b: 2 })).toBe(true);
    expect(isTrimanRoll({ a: 2, b: 1 })).toBe(true);
  });

  it("is false otherwise", () => {
    expect(isTrimanRoll({ a: 2, b: 4 })).toBe(false);
    expect(isTrimanRoll({ a: 5, b: 5 })).toBe(false);
    expect(isTrimanRoll({ a: 6, b: 6 })).toBe(false);
    expect(isTrimanRoll({ a: 4, b: 4 })).toBe(false);
  });
});

describe("evaluateActiveRoll — sum rules", () => {
  it("resolves the previous player's actual name on a 7, wrapping at index 0", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 5, b: 2 },
      players,
      currentPlayerIndex: 0,
      trimanPlayerId: "none",
    });
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ kind: "sum-seven", headline: "7" });
    expect(effects[0]!.detail).toBe("Chloé boit 1 gorgée");
  });

  it("resolves the previous player's actual name on a 7 for a non-zero index", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 4, b: 3 },
      players,
      currentPlayerIndex: 2,
      trimanPlayerId: "none",
    });
    const sevenEffect = effects.find((effect) => effect.kind === "sum-seven");
    expect(sevenEffect?.detail).toBe("Emma boit 1 gorgée");
  });

  it("resolves the roller on a 9", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 5, b: 4 },
      players,
      currentPlayerIndex: 1,
      trimanPlayerId: "none",
    });
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ kind: "sum-nine", headline: "9" });
    expect(effects[0]!.detail).toBe("Emma boit 1 gorgée");
  });

  it("resolves the next player's actual name on an 11, wrapping at the last index", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 5, b: 6 },
      players,
      currentPlayerIndex: 3,
      trimanPlayerId: "none",
    });
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ kind: "sum-eleven", headline: "11" });
    expect(effects[0]!.detail).toBe("Samuel boit 1 gorgée");
  });
});

describe("evaluateActiveRoll — Triman rule", () => {
  it("has the current Triman drink, using their actual name", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 3, b: 5 },
      players,
      currentPlayerIndex: 1,
      trimanPlayerId: "p3",
    });
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ kind: "triman", headline: "Triman" });
    expect(effects[0]!.detail).toBe("Chloé boit 1 gorgée");
  });
});

describe("evaluateActiveRoll — 6+X reflex rules", () => {
  it("6+1 triggers the 1-finger reflex regardless of die order", () => {
    for (const dice of [
      { a: 6, b: 1 },
      { a: 1, b: 6 },
    ]) {
      const effects = evaluateActiveRoll({
        dice,
        players,
        currentPlayerIndex: 0,
        trimanPlayerId: "none",
      });
      expect(effects).toHaveLength(1);
      expect(effects[0]).toMatchObject({
        kind: "reflex-finger-1",
        headline: "1 doigt !",
        isReflex: true,
      });
    }
  });

  it("6+2 triggers the 2-finger reflex regardless of die order", () => {
    for (const dice of [
      { a: 6, b: 2 },
      { a: 2, b: 6 },
    ]) {
      const effects = evaluateActiveRoll({
        dice,
        players,
        currentPlayerIndex: 0,
        trimanPlayerId: "none",
      });
      expect(effects).toHaveLength(1);
      expect(effects[0]).toMatchObject({
        kind: "reflex-finger-2",
        headline: "2 doigts !",
        isReflex: true,
      });
    }
  });

  it("6+3 triggers FIST, not three fingers — and also the Triman rule", () => {
    for (const dice of [
      { a: 6, b: 3 },
      { a: 3, b: 6 },
    ]) {
      const effects = evaluateActiveRoll({
        dice,
        players,
        currentPlayerIndex: 0,
        trimanPlayerId: "p1",
      });
      const fist = effects.find((effect) => effect.kind === "reflex-fist");
      expect(fist).toMatchObject({ headline: "Poing !", isReflex: true });
      expect(effects.some((effect) => effect.kind === "reflex-finger-2")).toBe(false);
      expect(effects.some((effect) => effect.kind === "triman")).toBe(true);
      expect(effects).toHaveLength(2);
    }
  });

  it("6+6 is a double, not a reflex rule", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 6, b: 6 },
      players,
      currentPlayerIndex: 0,
      trimanPlayerId: "none",
    });
    expect(effects).toHaveLength(1);
    expect(effects[0]).toMatchObject({ kind: "double", headline: "Double 6" });
  });
});

describe("evaluateActiveRoll — doubles", () => {
  it.each([1, 2, 3, 4, 5, 6])(
    "double %i has the roller drink and distribute that many sips",
    (face) => {
      const effects = evaluateActiveRoll({
        dice: { a: face, b: face },
        players,
        currentPlayerIndex: 0,
        trimanPlayerId: "none",
      });
      const double = effects.find((effect) => effect.kind === "double");
      expect(double).toBeDefined();
      expect(double!.headline).toBe(`Double ${face}`);
      expect(double!.detail).toContain("Samuel");
      expect(double!.detail).toContain(String(face));
    },
  );
});

describe("evaluateActiveRoll — rule stacking", () => {
  it("3+4 triggers both the Triman rule and the 7 rule", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 3, b: 4 },
      players,
      currentPlayerIndex: 1,
      trimanPlayerId: "p2",
    });
    expect(effects).toHaveLength(2);
    expect(effects.map((effect) => effect.kind).sort()).toEqual(["sum-seven", "triman"]);
  });

  it("3+3 triggers the Triman rule and the double rule", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 3, b: 3 },
      players,
      currentPlayerIndex: 0,
      trimanPlayerId: "p0",
    });
    expect(effects).toHaveLength(2);
    const kinds = effects.map((effect) => effect.kind).sort();
    expect(kinds).toEqual(["double", "triman"]);
    // The roller is also the Triman: both effects concern Samuel independently.
    expect(effects.every((effect) => effect.detail.includes("Samuel"))).toBe(true);
  });

  it("3+6 triggers the Triman rule and FIST", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 3, b: 6 },
      players,
      currentPlayerIndex: 0,
      trimanPlayerId: "p1",
    });
    expect(effects).toHaveLength(2);
    expect(effects.map((effect) => effect.kind).sort()).toEqual(["reflex-fist", "triman"]);
  });

  it("returns no effects for a roll that matches nothing", () => {
    const effects = evaluateActiveRoll({
      dice: { a: 2, b: 4 },
      players,
      currentPlayerIndex: 0,
      trimanPlayerId: "none",
    });
    expect(effects).toEqual([]);
  });
});
