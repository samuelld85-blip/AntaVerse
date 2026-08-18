import { describe, expect, it } from "vitest";
import { nextPlayerIndex, pickBySlot, pickDistinctBySlots, previousPlayerIndex } from "./players";

describe("circular indexing", () => {
  it("wraps forward at the last index", () => {
    expect(nextPlayerIndex(3, 4)).toBe(0);
    expect(nextPlayerIndex(0, 4)).toBe(1);
  });

  it("wraps backward at index 0", () => {
    expect(previousPlayerIndex(0, 4)).toBe(3);
    expect(previousPlayerIndex(3, 4)).toBe(2);
  });
});

describe("pickBySlot", () => {
  it("maps a 0..1 slot proportionally into the pool", () => {
    const pool = ["a", "b", "c", "d"];
    expect(pickBySlot(pool, 0)).toBe("a");
    expect(pickBySlot(pool, 0.99)).toBe("d");
    expect(pickBySlot(pool, 0.5)).toBe("c");
  });
});

describe("pickDistinctBySlots", () => {
  it("never repeats a player across picks", () => {
    const pool = ["a", "b", "c", "d"];
    const picked = pickDistinctBySlots(pool, [0, 0]);
    expect(picked).toHaveLength(2);
    expect(new Set(picked).size).toBe(2);
  });

  it("clamps to the pool size when more slots are given than players", () => {
    const pool = ["a", "b"];
    const picked = pickDistinctBySlots(pool, [0.1, 0.2, 0.3]);
    expect(picked).toHaveLength(2);
  });
});
