import type { GeofenceResult } from "./geofence.js";

export interface AlertTrackerOptions {
  /** Do not alert for the same zone + status again within this time. Default 5 minutes. */
  cooldownMs?: number;
}

export interface AlertTracker {
  /** Returns true only when a new alert should be shown. */
  check(result: GeofenceResult | null, nowMs: number): boolean;
  reset(): void;
}

// Safe zones never alert. Everything else is "zoneId:status".
function alertKey(result: GeofenceResult | null): string | null {
  const primary = result?.primary;
  if (!primary || primary.zone.type === "safe") return null;
  return `${primary.zone.id}:${primary.status}`;
}

/**
 * Rules:
 * - Alert when the tourist enters a new zone, or goes from "near" to "inside".
 * - No repeat alert while the key stays the same.
 * - If the tourist leaves and comes back within the cooldown (GPS jitter at the
 *   edge), no new alert.
 */
export function createAlertTracker(options: AlertTrackerOptions = {}): AlertTracker {
  const cooldownMs = options.cooldownMs ?? 5 * 60 * 1000;
  let currentKey: string | null = null;
  const lastAlertAt = new Map<string, number>();

  return {
    check(result, nowMs) {
      const key = alertKey(result);
      const changed = key !== currentKey;
      currentKey = key;

      if (!changed || key === null) return false;

      const last = lastAlertAt.get(key);
      if (last !== undefined && nowMs - last < cooldownMs) return false;

      lastAlertAt.set(key, nowMs);
      return true;
    },
    reset() {
      currentKey = null;
      lastAlertAt.clear();
    }
  };
}