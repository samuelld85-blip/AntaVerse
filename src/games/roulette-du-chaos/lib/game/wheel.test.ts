import { describe, expect, it } from "vitest";
import { CATEGORIES, pickEvent, pickWeightedCategory } from "./wheel";
import type { EventDefinition } from "./types";

function slotForCategory(id: string, fraction = 0.5): number {
  let offset = 0;
  for (const category of CATEGORIES) {
    if (category.id === id) return (offset + category.weight * fraction) / 100;
    offset += category.weight;
  }
  throw new Error(`unknown category ${id}`);
}

describe("CATEGORIES", () => {
  it("weights sum to 100", () => {
    expect(CATEGORIES.reduce((sum, category) => sum + category.weight, 0)).toBe(100);
  });

  it("has exactly the eight documented categories", () => {
    expect(CATEGORIES.map((category) => category.id)).toEqual([
      "DISTRIBUE",
      "SUBIS",
      "DUEL",
      "TOUS",
      "CHOISIS",
      "DESTIN",
      "REGLE",
      "JACKPOT",
    ]);
  });
});

describe("pickWeightedCategory", () => {
  it("lands on each category within its weighted slice", () => {
    for (const category of CATEGORIES) {
      expect(pickWeightedCategory(slotForCategory(category.id, 0.5))).toBe(category.id);
    }
  });

  it("picks JACKPOT only in the last 4% of the roll", () => {
    expect(pickWeightedCategory(0.965)).toBe("JACKPOT");
    expect(pickWeightedCategory(0.955)).not.toBe("JACKPOT");
  });

  it("never throws for boundary slot values", () => {
    expect(() => pickWeightedCategory(0)).not.toThrow();
    expect(() => pickWeightedCategory(0.999999)).not.toThrow();
  });
});

function makeEvents(ids: string[]): EventDefinition[] {
  return ids.map((id) => ({
    id,
    category: "DISTRIBUE",
    title: id,
    prompt: id,
    visualHint: "none",
    resolve: () => ({ status: "done", outcome: { headline: id, lines: [], tone: "normal" } }),
  }));
}

describe("pickEvent", () => {
  const events = makeEvents(["a", "b", "c", "d"]);

  it("picks by index proportionally to the slot value", () => {
    expect(pickEvent(events, [], 0).id).toBe("a");
    expect(pickEvent(events, [], 0.99).id).toBe("d");
  });

  it("avoids repeating the most recent event when other options exist", () => {
    // Slot 0 would normally pick "a", but "a" was just played.
    const result = pickEvent(events, ["a"], 0);
    expect(result.id).not.toBe("a");
  });

  it("avoids the last two recent events, not just the latest", () => {
    const result = pickEvent(events, ["a", "b"], 0);
    expect(["c", "d"]).toContain(result.id);
  });

  it("falls back to the full pool if every event is 'recent' (small category)", () => {
    const twoEvents = makeEvents(["x", "y"]);
    const result = pickEvent(twoEvents, ["x", "y"], 0);
    expect(["x", "y"]).toContain(result.id);
  });
});
