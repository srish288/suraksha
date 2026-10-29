import { describe, expect, it } from "vitest";
import type { Zone } from "../types.js";
import { createAlertTracker } from "./alert-tracker.js";
import { evaluatePosition } from "./geofence.js";

function makeZone(overrides: Partial<Zone> & Pick<Zone, "id" | "type">): Zone {
  return {
    name: overrides.id,
    description: "",
    center: { lat: 0, lng: 0 },
    radiusMeters: 100,
    alertDistanceMeters: 0,
    active: true,
    isSample: true,
    ...overrides
  };
}

const flood = makeZone({
  id: "flood",
  type: "emergency",
  center: { lat: 28.6, lng: 77.24 },
  radiusMeters: 250,
  alertDistanceMeters: 300
});

const restrictedPolygon = makeZone({
  id: "restricted",
  type: "restricted",
  center: { lat: 28.6211, lng: 77.2112 },
  radiusMeters: 0,
  alertDistanceMeters: 100,
  polygon: [
    { lat: 28.62, lng: 77.21 },
    { lat: 28.6205, lng: 77.2128 },
    { lat: 28.6222, lng: 77.2122 },
    { lat: 28.6218, lng: 77.2098 }
  ]
});

describe("evaluatePosition: circle zones", () => {
  it("is inside at the center", () => {
    const r = evaluatePosition({ lat: 28.6, lng: 77.24 }, [flood]);
    expect(r.primary?.status).toBe("inside");
    expect(r.primary?.zone.id).toBe("flood");
  });

  it("is near when outside but within the alert distance", () => {
    // about 400 m north of the center, so about 150 m from the edge
    const r = evaluatePosition({ lat: 28.6036, lng: 77.24 }, [flood]);
    expect(r.primary?.status).toBe("near");
    expect(r.primary!.distanceMeters).toBeGreaterThan(140);
    expect(r.primary!.distanceMeters).toBeLessThan(160);
  });

  it("has no match when far away", () => {
    const r = evaluatePosition({ lat: 28.609, lng: 77.24 }, [flood]);
    expect(r.primary).toBeNull();
    expect(r.matches).toHaveLength(0);
  });
});

describe("evaluatePosition: polygon zones", () => {
  it("is inside the polygon", () => {
    const r = evaluatePosition({ lat: 28.6211, lng: 77.2112 }, [restrictedPolygon]);
    expect(r.primary?.status).toBe("inside");
  });

  it("is near, about 75 m below the bottom edge", () => {
    const r = evaluatePosition({ lat: 28.6195, lng: 77.211 }, [restrictedPolygon]);
    expect(r.primary?.status).toBe("near");
    expect(r.primary!.distanceMeters).toBeGreaterThan(50);
    expect(r.primary!.distanceMeters).toBeLessThan(100);
  });

  it("has no match about 200 m away", () => {
    const r = evaluatePosition({ lat: 28.618, lng: 77.211 }, [restrictedPolygon]);
    expect(r.primary).toBeNull();
  });
});

describe("evaluatePosition: rules", () => {
  it("ignores inactive zones", () => {
    const off = { ...flood, active: false };
    const r = evaluatePosition({ lat: 28.6, lng: 77.24 }, [off]);
    expect(r.primary).toBeNull();
  });

  it("picks the most serious zone when zones overlap", () => {
    const caution = makeZone({ id: "c", type: "caution" });
    const emergency = makeZone({ id: "e", type: "emergency" });
    const r = evaluatePosition({ lat: 0, lng: 0 }, [caution, emergency]);
    expect(r.primary?.zone.id).toBe("e");
    expect(r.matches).toHaveLength(2);
  });

  it("reports a safe zone when inside it and nothing else applies", () => {
    const safe = makeZone({ id: "s", type: "safe" });
    const r = evaluatePosition({ lat: 0, lng: 0 }, [safe]);
    expect(r.primary?.zone.type).toBe("safe");
  });

  it("never gives a near match for a safe zone", () => {
    const safe = makeZone({ id: "s", type: "safe", alertDistanceMeters: 500 });
    const r = evaluatePosition({ lat: 0.001, lng: 0 }, [safe]);
    expect(r.primary).toBeNull();
  });
});

describe("createAlertTracker", () => {
  const zone = makeZone({
    id: "r",
    type: "restricted",
    radiusMeters: 100,
    alertDistanceMeters: 200
  });
  const inside = evaluatePosition({ lat: 0, lng: 0 }, [zone]);
  const near = evaluatePosition({ lat: 0.0015, lng: 0 }, [zone]);
  const outside = evaluatePosition({ lat: 0.01, lng: 0 }, [zone]);
  const t0 = 1_000_000;

  it("alerts once, then stays quiet in the same zone", () => {
    const tracker = createAlertTracker();
    expect(tracker.check(inside, t0)).toBe(true);
    expect(tracker.check(inside, t0 + 10_000)).toBe(false);
    expect(tracker.check(inside, t0 + 20_000)).toBe(false);
  });

  it("alerts again when going from near to inside", () => {
    const tracker = createAlertTracker();
    expect(tracker.check(near, t0)).toBe(true);
    expect(tracker.check(near, t0 + 10_000)).toBe(false);
    expect(tracker.check(inside, t0 + 20_000)).toBe(true);
  });

  it("does not alert again for edge jitter within the cooldown", () => {
    const tracker = createAlertTracker({ cooldownMs: 5 * 60 * 1000 });
    expect(tracker.check(inside, t0)).toBe(true);
    expect(tracker.check(outside, t0 + 10_000)).toBe(false);
    expect(tracker.check(inside, t0 + 60_000)).toBe(false);
  });

  it("alerts again when coming back after the cooldown", () => {
    const tracker = createAlertTracker({ cooldownMs: 5 * 60 * 1000 });
    expect(tracker.check(inside, t0)).toBe(true);
    expect(tracker.check(outside, t0 + 70_000)).toBe(false);
    expect(tracker.check(inside, t0 + 11 * 60 * 1000)).toBe(true);
  });

  it("never alerts for safe zones or no zone", () => {
    const safe = makeZone({ id: "s", type: "safe" });
    const tracker = createAlertTracker();
    expect(tracker.check(evaluatePosition({ lat: 0, lng: 0 }, [safe]), t0)).toBe(false);
    expect(tracker.check(null, t0 + 1000)).toBe(false);
  });
});