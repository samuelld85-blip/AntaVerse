import { describe, expect, it } from "vitest";
import { cards } from "./cards";
describe("banque de cartes", () => {
  it("contient au moins 500 cartes uniques avec exactement trois interdits", () => {
    expect(cards.length).toBeGreaterThanOrEqual(500);
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
    expect(new Set(cards.map((card) => card.word.toLocaleLowerCase("fr"))).size).toBe(cards.length);
    expect(
      cards.every((card) => card.forbidden.length === 3 && card.forbidden.every(Boolean)),
    ).toBe(true);
  });
});
