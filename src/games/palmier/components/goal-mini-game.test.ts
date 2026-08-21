import { describe, expect, it } from "vitest";
import { clampVelocity, getGoalGapMultiplier, getGoalTier } from "./goal-mini-game";

const CARD_W = 100;

describe("getGoalTier", () => {
  it("returns 0 for first 5 cards", () => {
    expect(getGoalTier(52, 52)).toBe(0); // 0 drawn
    expect(getGoalTier(52, 48)).toBe(0); // 4 drawn
  });

  it("advances tier every 5 cards", () => {
    expect(getGoalTier(52, 47)).toBe(1); // 5 drawn
    expect(getGoalTier(52, 42)).toBe(2); // 10 drawn
    expect(getGoalTier(52, 7)).toBe(9);  // 45 drawn
  });

  it("caps at tier 9 regardless of draws", () => {
    expect(getGoalTier(52, 0)).toBe(9); // 52 drawn
    expect(getGoalTier(52, 1)).toBe(9); // 51 drawn
  });
});

describe("getGoalGapMultiplier", () => {
  it("returns largest gap for tier 0", () => {
    expect(getGoalGapMultiplier(0)).toBe(3.75);
  });

  it("returns smallest gap for tier 9", () => {
    expect(getGoalGapMultiplier(9)).toBe(1.35);
  });

  it("gap decreases monotonically", () => {
    const gaps = Array.from({ length: 10 }, (_, i) => getGoalGapMultiplier(i));
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]!).toBeLessThan(gaps[i - 1]!);
    }
  });

  it("clamps out-of-range tiers", () => {
    expect(getGoalGapMultiplier(-1)).toBe(3.75);
    expect(getGoalGapMultiplier(10)).toBe(1.35);
  });

  it("minimum gap at tier 9 is tight (requires precision)", () => {
    const gapPx = getGoalGapMultiplier(9) * CARD_W;
    expect(gapPx).toBeGreaterThanOrEqual(CARD_W * 1.3);
    expect(gapPx).toBeLessThanOrEqual(CARD_W * 1.4);
  });
});

describe("clampVelocity", () => {
  it("ensures minimum upward speed (negative vy)", () => {
    // A slow upward drag — vy = -100 → must be clamped to at least -500
    const { vy } = clampVelocity(0, -100);
    expect(vy).toBeLessThanOrEqual(-500);
  });

  it("does not reduce a fast upward shot", () => {
    const { vy } = clampVelocity(0, -2000);
    expect(vy).toBe(-2000);
  });

  it("clamps vy that exceeds max upward speed", () => {
    const { vy } = clampVelocity(0, -9999);
    expect(vy).toBe(-5000);
  });

  it("clamps horizontal velocity", () => {
    const { vx: left } = clampVelocity(-9999, -600);
    expect(left).toBe(-5000);
    const { vx: right } = clampVelocity(9999, -600);
    expect(right).toBe(5000);
  });

  it("passes through normal velocity unchanged", () => {
    const { vx, vy } = clampVelocity(300, -1500);
    expect(vx).toBe(300);
    expect(vy).toBe(-1500);
  });
});
