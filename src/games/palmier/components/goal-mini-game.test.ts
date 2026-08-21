import { describe, expect, it } from "vitest";
import { clampVelocity } from "./goal-mini-game";

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
