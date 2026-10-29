import type { ZoneType } from "../constants.js";
import type { LatLng, Zone } from "../types.js";
import {
  distanceToPolygonEdgeMeters,
  haversineMeters,
  pointInPolygon
} from "./geo.js";

/** Higher number = more serious. */
export const ZONE_SEVERITY: Record<ZoneType, number> = {
  safe: 0,
  caution: 1,
  restricted: 2,
  emergency: 3
};

export type ZoneStatus = "inside" | "near";

export interface ZoneMatch {
  zone: Zone;
  status: ZoneStatus;
  /** 0 when inside. Otherwise distance to the zone edge, in meters. */
  distanceMeters: number;
}

export interface GeofenceResult {
  position: LatLng;
  /** The most serious match, or null when nothing applies. */
  primary: ZoneMatch | null;
  /** All matches, most serious first. */
  matches: ZoneMatch[];
}

function hasPolygon(zone: Zone): zone is Zone & { polygon: LatLng[] } {
  return Array.isArray(zone.polygon) && zone.polygon.length >= 3;
}

export function isPointInZone(point: LatLng, zone: Zone): boolean {
  if (hasPolygon(zone)) return pointInPolygon(point, zone.polygon);
  return haversineMeters(point, zone.center) <= zone.radiusMeters;
}

/** 0 if inside the zone, otherwise the distance to its edge in meters. */
export function distanceToZoneMeters(point: LatLng, zone: Zone): number {
  if (isPointInZone(point, zone)) return 0;
  if (hasPolygon(zone)) return distanceToPolygonEdgeMeters(point, zone.polygon);
  return Math.max(0, haversineMeters(point, zone.center) - zone.radiusMeters);
}

/**
 * Rules:
 * - Inactive zones are ignored (a missing `active` means active).
 * - "inside": the point is in the zone (any level).
 * - "near": the point is outside, but within alertDistanceMeters of the edge.
 *   Safe zones never give a "near" match. A missing alert distance means 0.
 * - Sorted by severity (emergency first), then inside before near, then closest.
 */
export function evaluatePosition(position: LatLng, zones: readonly Zone[]): GeofenceResult {
  const matches: ZoneMatch[] = [];

  for (const zone of zones) {
    if (zone.active === false) continue;

    const distanceMeters = distanceToZoneMeters(position, zone);
    const alertDistance = zone.alertDistanceMeters ?? 0;

    if (distanceMeters === 0) {
      matches.push({ zone, status: "inside", distanceMeters: 0 });
    } else if (
      zone.type !== "safe" &&
      alertDistance > 0 &&
      distanceMeters <= alertDistance
    ) {
      matches.push({ zone, status: "near", distanceMeters });
    }
  }

  matches.sort((a, b) => {
    const severity = ZONE_SEVERITY[b.zone.type] - ZONE_SEVERITY[a.zone.type];
    if (severity !== 0) return severity;
    if (a.status !== b.status) return a.status === "inside" ? -1 : 1;
    return a.distanceMeters - b.distanceMeters;
  });

  return { position, primary: matches[0] ?? null, matches };
}