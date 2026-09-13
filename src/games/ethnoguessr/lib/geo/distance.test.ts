import { describe, expect, it } from "vitest";
import { distanceKm, pointsForDistance } from "./distance";

describe("distanceKm", () => {
  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 48.86, lon: 2.35 }, { lat: 48.86, lon: 2.35 })).toBe(0);
  });

  it("matches the known Paris-Brussels distance within a few km", () => {
    const km = distanceKm({ lat: 48.86, lon: 2.35 }, { lat: 50.85, lon: 4.35 });
    expect(km).toBeGreaterThan(255);
    expect(km).toBeLessThan(270);
  });

  it("is close to half the Earth's circumference for antipodal points", () => {
    const km = distanceKm({ lat: 0, lon: 0 }, { lat: 0, lon: 180 });
    expect(km).toBeGreaterThan(19900);
    expect(km).toBeLessThan(20100);
  });
});

describe("pointsForDistance", () => {
  it("gives full marks for the correct country or a genuine neighbor", () => {
    expect(pointsForDistance(0)).toBe(5);
    expect(pointsForDistance(300)).toBe(5);
  });

  it("scores a same-region-wrong-country miss in the middle of the scale", () => {
    // Brazil (Brasília) guessed for a Southern Cone country: ~1970km to Buenos Aires.
    expect(pointsForDistance(1970)).toBe(3);
    // ~2650km to Santiago.
    expect(pointsForDistance(2650)).toBe(2);
  });

  it("gives zero only for a guess on roughly the opposite side of the world", () => {
    expect(pointsForDistance(9000)).toBe(1);
    expect(pointsForDistance(9001)).toBe(0);
    expect(pointsForDistance(19900)).toBe(0);
  });
});
