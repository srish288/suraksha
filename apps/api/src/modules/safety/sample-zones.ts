import type { Zone } from "@suraksha/shared";

// FICTIONAL demo zones. NOT official safety information.
// Move the centers to your demo city if needed.
export const SAMPLE_ZONES: Omit<Zone, "id">[] = [
  {
    name: "Sample Tourist Plaza (fictional)",
    type: "safe",
    description: "Fictional demo zone: well-lit, busy area. Not official safety information.",
    center: { lat: 28.6129, lng: 77.2295 },
    radiusMeters: 400,
    alertDistanceMeters: 0,
    active: true,
    isSample: true
  },
  {
    name: "Sample Crowded Market (fictional)",
    type: "caution",
    description: "Fictional demo zone: crowded place, watch your belongings. Not official safety information.",
    center: { lat: 28.6315, lng: 77.2167 },
    radiusMeters: 300,
    alertDistanceMeters: 150,
    active: true,
    isSample: true
  },
  {
    name: "Sample Road Work Area (fictional)",
    type: "caution",
    description: "Fictional demo zone: road work, uneven ground. Not official safety information.",
    center: { lat: 28.6165, lng: 77.2055 },
    radiusMeters: 0,
    polygon: [
      { lat: 28.6150, lng: 77.2040 },
      { lat: 28.6152, lng: 77.2068 },
      { lat: 28.6180, lng: 77.2062 },
      { lat: 28.6177, lng: 77.2038 }
    ],
    alertDistanceMeters: 100,
    active: true,
    isSample: true
  },
  {
    name: "Sample Restricted Site (fictional)",
    type: "restricted",
    description: "Fictional demo zone: entry not allowed. Not official safety information.",
    center: { lat: 28.6211, lng: 77.2112 },
    radiusMeters: 0,
    polygon: [
      { lat: 28.6200, lng: 77.2100 },
      { lat: 28.6205, lng: 77.2128 },
      { lat: 28.6222, lng: 77.2122 },
      { lat: 28.6218, lng: 77.2098 }
    ],
    alertDistanceMeters: 100,
    active: true,
    isSample: true
  },
  {
    name: "Sample Flood Hazard (fictional)",
    type: "emergency",
    description: "Fictional demo zone: flooding danger, leave the area. Not official safety information.",
    center: { lat: 28.6000, lng: 77.2400 },
    radiusMeters: 250,
    alertDistanceMeters: 300,
    active: true,
    isSample: true
  },
  {
    name: "Sample Closed Event Area (fictional, inactive)",
    type: "restricted",
    description: "Fictional demo zone that is switched off. Used to test the active flag.",
    center: { lat: 28.6400, lng: 77.2300 },
    radiusMeters: 200,
    alertDistanceMeters: 0,
    active: false,
    isSample: true
  }
];