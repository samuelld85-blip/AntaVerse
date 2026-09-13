export interface GeoPoint {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle ("as the crow flies") distance between two points, in km. */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Max distance (km) that still earns each point value. Tuned so that 5 is
// hard to reach (the actual country, or a genuinely bordering one — France
// guessing Belgium is ~260km, Brazil guessing Argentina is ~1970km and lands
// in the 3-point band instead), 0 only happens for a guess on roughly the
// opposite side of the planet, and a same-region-wrong-country miss (e.g.
// Brazil for a Southern Cone country) typically scores 2-3.
const POINT_BANDS: readonly [maxKm: number, points: 5 | 4 | 3 | 2 | 1][] = [
  [300, 5],
  [900, 4],
  [2200, 3],
  [4500, 2],
  [9000, 1],
];

export function pointsForDistance(km: number): 0 | 1 | 2 | 3 | 4 | 5 {
  for (const [maxKm, points] of POINT_BANDS) {
    if (km <= maxKm) return points;
  }
  return 0;
}
