import { describe, expect, it } from "vitest";
import {
  distanceToPolygonEdgeMeters,
  distanceToSegmentMeters,
  haversineMeters,
  pointInPolygon
} from "./geo.js";

const square = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 1 },
  { lat: 1, lng: 1 },
  { lat: 1, lng: 0 }
];

describe("haversineMeters", () => {
  it("is 0 for the same point", () => {
    expect(haversineMeters({ lat: 28.6, lng: 77.2 }, { lat: 28.6, lng: 77.2 })).toBe(0);
  });

  it("is about 111.2 km for 1 degree of latitude", () => {
    const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
    expect(Math.abs(d - 111195)).toBeLessThan(5);
  });
});

describe("pointInPolygon", () => {
  it("returns true for a point inside", () => {
    expect(pointInPolygon({ lat: 0.5, lng: 0.5 }, square)).toBe(true);
  });

  it("returns false for points outside", () => {
    expect(pointInPolygon({ lat: 1.5, lng: 0.5 }, square)).toBe(false);
    expect(pointInPolygon({ lat: 0.5, lng: -0.1 }, square)).toBe(false);
  });

  it("returns false when the polygon has fewer than 3 points", () => {
    expect(pointInPolygon({ lat: 0, lng: 0 }, square.slice(0, 2))).toBe(false);
  });
});

describe("distanceToSegmentMeters", () => {
  const a = { lat: 0, lng: 0 };
  const b = { lat: 0, lng: 1 };

  it("measures the side distance to a segment", () => {
    const d = distanceToSegmentMeters({ lat: 0.001, lng: 0.5 }, a, b);
    expect(Math.abs(d - 111.19)).toBeLessThan(1);
  });

  it("measures the distance to the nearest end when past the segment", () => {
    const d = distanceToSegmentMeters({ lat: 0, lng: 1.001 }, a, b);
    expect(Math.abs(d - 111.19)).toBeLessThan(1);
  });
});

describe("distanceToPolygonEdgeMeters", () => {
  it("measures the distance to the closest edge", () => {
    const d = distanceToPolygonEdgeMeters({ lat: 0.5, lng: -0.001 }, square);
    expect(Math.abs(d - 111.19)).toBeLessThan(1);
  });
});