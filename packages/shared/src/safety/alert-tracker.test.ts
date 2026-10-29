import { describe, expect, it } from "vitest";
import type { Zone } from "../types.js";
import { createAlertTracker } from "./alert-tracker.js";
import type { GeofenceResult, ZoneStatus } from "./geofence.js";

const MINUTE = 60_000;
const DEFAULT_COOLDOWN = 5 * MINUTE;

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

function resultFor(zone: Zone, status: ZoneStatus): GeofenceResult {
  const match = {
    zone,
    status,
    distanceMeters: status === "inside" ? 0 : 50
  };
  return { position: { lat: 0, lng: 0 }, primary: match, matches: [match] };
}

const noMatch: GeofenceResult = {
  position: { lat: 0, lng: 0 },
  primary: null,
  matches: []
};

const caution = makeZone({ id: "caution-a", type: "caution" });
const restricted = makeZone({ id: "restricted-a", type: "restricted" });
const emergency = makeZone({ id: "emergency-a", type: "emergency" });
const safe = makeZone({ id: "safe-a", type: "safe" });

describe("createAlertTracker: first alert", () => {
  it("alerts the first time the person is inside a non-safe zone", () => {
    const tracker = createAlertTracker();
    expect(tracker.check(resultFor(caution, "inside"), 0)).toBe(true);
  });

  it("alerts the first time the person is near a non-safe zone", () => {
    const tracker = createAlertTracker();
    expect(tracker.check(resultFor(restricted, "near"), 0)).toBe(true);
  });
});

describe("createAlertTracker: repeated checks", () => {
  it("does not repeat while the same zone and status stay active, even after the cooldown", () => {
    const tracker = createAlertTracker();
    const inside = resultFor(emergency, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(inside, 1 * MINUTE)).toBe(false);
    expect(tracker.check(inside, DEFAULT_COOLDOWN + MINUTE)).toBe(false);
  });
});

describe("createAlertTracker: near to inside", () => {
  it("alerts again when the status goes from near to inside", () => {
    const tracker = createAlertTracker();

    expect(tracker.check(resultFor(restricted, "near"), 0)).toBe(true);
    expect(tracker.check(resultFor(restricted, "near"), 10_000)).toBe(false);
    expect(tracker.check(resultFor(restricted, "inside"), 20_000)).toBe(true);
  });
});

describe("createAlertTracker: leaving and re-entering", () => {
  it("does not alert on re-entry within the cooldown", () => {
    const tracker = createAlertTracker();
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(noMatch, 1 * MINUTE)).toBe(false);
    expect(tracker.check(inside, 2 * MINUTE)).toBe(false);
  });

  it("alerts on re-entry once the cooldown has passed", () => {
    const tracker = createAlertTracker();
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(noMatch, 1 * MINUTE)).toBe(false);
    expect(tracker.check(inside, 6 * MINUTE)).toBe(true);
  });

  it("treats exactly the cooldown as elapsed, but one millisecond less as not", () => {
    const inside = resultFor(caution, "inside");

    const atBoundary = createAlertTracker();
    expect(atBoundary.check(inside, 0)).toBe(true);
    expect(atBoundary.check(noMatch, 1000)).toBe(false);
    expect(atBoundary.check(inside, DEFAULT_COOLDOWN)).toBe(true);

    const justBefore = createAlertTracker();
    expect(justBefore.check(inside, 0)).toBe(true);
    expect(justBefore.check(noMatch, 1000)).toBe(false);
    expect(justBefore.check(inside, DEFAULT_COOLDOWN - 1)).toBe(false);
  });

  it("uses a custom cooldownMs when provided", () => {
    const tracker = createAlertTracker({ cooldownMs: 10_000 });
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(noMatch, 1_000)).toBe(false);
    expect(tracker.check(inside, 5_000)).toBe(false);
    expect(tracker.check(noMatch, 6_000)).toBe(false);
    expect(tracker.check(inside, 10_000)).toBe(true);
  });
});

describe("createAlertTracker: safe zones", () => {
  it("never alerts for a safe zone", () => {
    const tracker = createAlertTracker();
    const inSafe = resultFor(safe, "inside");

    expect(tracker.check(inSafe, 0)).toBe(false);
    expect(tracker.check(inSafe, 10 * MINUTE)).toBe(false);
  });

  it("does not alert when moving from a non-safe zone into a safe zone", () => {
    const tracker = createAlertTracker();

    expect(tracker.check(resultFor(caution, "inside"), 0)).toBe(true);
    expect(tracker.check(resultFor(safe, "inside"), 1 * MINUTE)).toBe(false);
    // Back in the caution zone after the cooldown: a new alert is allowed.
    expect(tracker.check(resultFor(caution, "inside"), 6 * MINUTE)).toBe(true);
  });
});

describe("createAlertTracker: no match", () => {
  it("clears the current alert state when the result is null", () => {
    // cooldownMs 0 isolates the "current state" from the cooldown history.
    const tracker = createAlertTracker({ cooldownMs: 0 });
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(inside, 0)).toBe(false); // same key, still active
    expect(tracker.check(null, 0)).toBe(false);
    expect(tracker.check(inside, 0)).toBe(true); // state was cleared by null
  });

  it("treats a result with no primary match like null", () => {
    const tracker = createAlertTracker({ cooldownMs: 0 });
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(noMatch, 0)).toBe(false);
    expect(tracker.check(inside, 0)).toBe(true);
  });
});

describe("createAlertTracker: reset", () => {
  it("clears alert history so a recent alert no longer suppresses re-entry", () => {
    const tracker = createAlertTracker();
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(noMatch, 1_000)).toBe(false);
    tracker.reset();
    // Only 2 seconds after the first alert: suppressed without reset().
    expect(tracker.check(inside, 2_000)).toBe(true);
  });

  it("clears the current state so an ongoing alert can fire again", () => {
    const tracker = createAlertTracker();
    const inside = resultFor(caution, "inside");

    expect(tracker.check(inside, 0)).toBe(true);
    expect(tracker.check(inside, 1_000)).toBe(false);
    tracker.reset();
    expect(tracker.check(inside, 2_000)).toBe(true);
  });
});

describe("createAlertTracker: different zones", () => {
  it("alerts immediately for a different zone", () => {
    const tracker = createAlertTracker();

    expect(tracker.check(resultFor(caution, "inside"), 0)).toBe(true);
    expect(tracker.check(resultFor(emergency, "inside"), 1_000)).toBe(true);
  });
});