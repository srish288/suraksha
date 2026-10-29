import type { RiskLevel, ZoneType } from "../constants.js";
import type { LatLng, RiskAssessment, RiskFactor, Zone } from "../types.js";
import { evaluatePosition, isPointInZone } from "./geofence.js";

// All numbers are our own demo choices. They are NOT trained or tested on real data.
export const INSIDE_POINTS: Record<ZoneType, number> = {
  safe: 0,
  caution: 30,
  restricted: 60,
  emergency: 90
};

export const NEAR_POINTS: Record<ZoneType, number> = {
  safe: 0,
  caution: 15,
  restricted: 35,
  emergency: 55
};

export const NEAR_PROXIMITY_MAX_BONUS = 10;
export const EXTRA_ZONE_POINTS = 5;
export const EXTRA_ZONE_MAX_POINTS = 10;
export const MAX_SCORE = 100;
export const HIGH_THRESHOLD = 60;
export const MEDIUM_THRESHOLD = 25;

export function levelFromScore(score: number): RiskLevel {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= MEDIUM_THRESHOLD) return "medium";
  return "low";
}

/**
 * Rule-based risk. Same input always gives the same score (only the timestamp changes).
 * Only active zones count. Inactive zones the tourist is inside are listed with 0 points.
 */
export function assessRisk(
  position: LatLng,
  zones: readonly Zone[],
  now: Date = new Date()
): RiskAssessment {
  const result = evaluatePosition(position, zones);
  const factors: RiskFactor[] = [];
  const primary = result.primary;

  if (!primary) {
    factors.push({
      code: "NO_ZONE",
      label: "No known zone",
      points: 0,
      reason: "The position is not inside or near any active safety zone."
    });
  } else {
    const { zone, status, distanceMeters } = primary;

    if (status === "inside") {
      factors.push({
        code: "INSIDE_ZONE",
        label: `Inside ${zone.type} zone`,
        points: INSIDE_POINTS[zone.type],
        reason: `Inside "${zone.name}" (${zone.type}).`
      });
    } else {
      factors.push({
        code: "NEAR_ZONE",
        label: `Near ${zone.type} zone`,
        points: NEAR_POINTS[zone.type],
        reason: `About ${Math.round(distanceMeters)} m from "${zone.name}" (${zone.type}). Alert distance is ${zone.alertDistanceMeters ?? 0} m.`
      });

      const closeness = 1 - distanceMeters / (zone.alertDistanceMeters ?? 1);
      const bonus = Math.max(
        0,
        Math.min(NEAR_PROXIMITY_MAX_BONUS, Math.round(NEAR_PROXIMITY_MAX_BONUS * closeness))
      );
      if (bonus > 0) {
        factors.push({
          code: "NEAR_PROXIMITY",
          label: "Close to the zone edge",
          points: bonus,
          reason: `The closer to the edge, the higher the risk (+${bonus}, max +${NEAR_PROXIMITY_MAX_BONUS}).`
        });
      }
    }

    const extras = result.matches
      .slice(1)
      .filter((m) => m.zone.type !== "safe").length;
    if (extras > 0) {
      const points = Math.min(EXTRA_ZONE_MAX_POINTS, extras * EXTRA_ZONE_POINTS);
      factors.push({
        code: "OVERLAP",
        label: "More than one zone applies",
        points,
        reason: `${extras} other non-safe zone(s) also apply here (+${EXTRA_ZONE_POINTS} each, max +${EXTRA_ZONE_MAX_POINTS}).`
      });
    }
  }

  for (const zone of zones) {
    if (zone.active === false && isPointInZone(position, zone)) {
      factors.push({
        code: "INACTIVE_ZONE_IGNORED",
        label: "Inactive zone ignored",
        points: 0,
        reason: `Inside "${zone.name}", but this zone is switched off, so it adds no risk.`
      });
    }
  }

  const total = factors.reduce((sum, f) => sum + f.points, 0);
  const score = Math.min(MAX_SCORE, total);

  return {
    level: levelFromScore(score),
    score,
    factors,
    assessedAt: now.toISOString()
  };
}