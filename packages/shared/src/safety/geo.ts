import type { LatLng } from "../types.js";

const EARTH_RADIUS_M = 6_371_000;
const METERS_PER_DEGREE = (Math.PI / 180) * EARTH_RADIUS_M;

const toRad = (degrees: number): number => (degrees * Math.PI) / 180;

/** Straight-line distance over the earth's surface, in meters. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Ray-casting test. Works for any simple polygon (not self-crossing). */
export function pointInPolygon(point: LatLng, polygon: readonly LatLng[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    const crosses =
      pi.lat > point.lat !== pj.lat > point.lat &&
      point.lng < ((pj.lng - pi.lng) * (point.lat - pi.lat)) / (pj.lat - pi.lat) + pi.lng;
    if (crosses) inside = !inside;
  }
  return inside;
}

// Turn a lat/lng into flat x/y meters around `origin` (good enough for short distances).
function toLocalMeters(origin: LatLng, p: LatLng): { x: number; y: number } {
  return {
    x: (p.lng - origin.lng) * Math.cos(toRad(origin.lat)) * METERS_PER_DEGREE,
    y: (p.lat - origin.lat) * METERS_PER_DEGREE
  };
}

/** Shortest distance from a point to the line segment a-b, in meters. */
export function distanceToSegmentMeters(point: LatLng, a: LatLng, b: LatLng): number {
  const A = toLocalMeters(point, a);
  const B = toLocalMeters(point, b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const lengthSq = dx * dx + dy * dy;

  let t = lengthSq === 0 ? 0 : -(A.x * dx + A.y * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  return Math.hypot(A.x + t * dx, A.y + t * dy);
}

/** Shortest distance from a point to the edge of a polygon, in meters. */
export function distanceToPolygonEdgeMeters(
  point: LatLng,
  polygon: readonly LatLng[]
): number {
  let best = Infinity;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    best = Math.min(best, distanceToSegmentMeters(point, polygon[j], polygon[i]));
  }
  return best;
}