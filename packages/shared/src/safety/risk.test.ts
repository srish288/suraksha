import { describe, expect, it } from "vitest";
import type { Zone } from "../types.js";
import { assessRisk } from "./risk.js";

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

const origin = { lat: 0, lng: 0 };
// 1 degree of latitude is about 111195 m
const metersNorth = (m: number) => ({ lat: m / 111195, lng: 0 });

describe("assessRisk: inside a zone", () => {
  it("is low with 0 points when there is no zone", () => {
    const r = assessRisk(origin, []);
    expect(r.level).toBe("low");
    expect(r.score).toBe(0);
    expect(r.factors[0].code).toBe("NO_ZONE");
  });

  it("is low inside a safe zone", () => {
    const r = assessRisk(origin, [makeZone({ id: "s", type: "safe" })]);
    expect(r.level).toBe("low");
    expect(r.score).toBe(0);
  });

  it("is medium (30) inside a caution zone", () => {
    const r = assessRisk(origin, [makeZone({ id: "c", type: "caution" })]);
    expect(r.score).toBe(30);
    expect(r.level).toBe("medium");
  });

  it("is high (60) inside a restricted zone", () => {
    const r = assessRisk(origin, [makeZone({ id: "r", type: "restricted" })]);
    expect(r.score).toBe(60);
    expect(r.level).toBe("high");
  });

  it("is high (90) inside an emergency zone", () => {
    const r = assessRisk(origin, [makeZone({ id: "e", type: "emergency" })]);
    expect(r.score).toBe(90);
    expect(r.level).toBe("high");
  });
});

describe("assessRisk: near a zone", () => {
  it("adds half of the bonus at half the alert distance (restricted: 35 + 5)", () => {
    const zone = makeZone({ id: "r", type: "restricted", alertDistanceMeters: 200 });
    // 200 m from the center = 100 m from the edge
    const r = assessRisk(metersNorth(200), [zone]);
    expect(r.score).toBe(40);
    expect(r.level).toBe("medium");
    expect(r.factors.map((f) => f.code)).toEqual(["NEAR_ZONE", "NEAR_PROXIMITY"]);
  });

  it("is high when very close to an emergency zone edge", () => {
    const zone = makeZone({ id: "e", type: "emergency", alertDistanceMeters: 300 });
    // 5 m from the edge
    const r = assessRisk(metersNorth(105), [zone]);
    expect(r.score).toBe(65);
    expect(r.level).toBe("high");
  });

  it("stays low when near the far end of a caution alert distance", () => {
    const zone = makeZone({ id: "c", type: "caution", alertDistanceMeters: 150 });
    // 140 m from the edge
    const r = assessRisk(metersNorth(240), [zone]);
    expect(r.score).toBeLessThan(25);
    expect(r.level).toBe("low");
  });

  it("is low outside the alert distance", () => {
    const zone = makeZone({ id: "r", type: "restricted", alertDistanceMeters: 100 });
    const r = assessRisk(metersNorth(500), [zone]);
    expect(r.score).toBe(0);
  });
});

describe("assessRisk: other rules", () => {
  it("adds +5 for one overlapping zone", () => {
    const r = assessRisk(origin, [
      makeZone({ id: "c", type: "caution" }),
      makeZone({ id: "e", type: "emergency" })
    ]);
    expect(r.score).toBe(95);
    expect(r.factors.some((f) => f.code === "OVERLAP")).toBe(true);
  });

  it("caps the score at 100", () => {
    const r = assessRisk(origin, [
      makeZone({ id: "c", type: "caution" }),
      makeZone({ id: "r", type: "restricted" }),
      makeZone({ id: "e", type: "emergency" })
    ]);
    expect(r.score).toBe(100);
  });

  it("ignores an inactive zone but explains it", () => {
    const r = assessRisk(origin, [makeZone({ id: "x", type: "emergency", active: false })]);
    expect(r.score).toBe(0);
    expect(r.level).toBe("low");
    expect(r.factors.some((f) => f.code === "INACTIVE_ZONE_IGNORED")).toBe(true);
  });

  it("uses the given time for the timestamp", () => {
    const now = new Date("2026-10-30T00:00:00.000Z");
    expect(assessRisk(origin, [], now).assessedAt).toBe("2026-10-30T00:00:00.000Z");
  });

  it("gives a reason for every factor", () => {
    const r = assessRisk(origin, [makeZone({ id: "r", type: "restricted" })]);
    for (const f of r.factors) {
      expect(f.reason.length).toBeGreaterThan(0);
      expect(f.label.length).toBeGreaterThan(0);
    }
  });
});