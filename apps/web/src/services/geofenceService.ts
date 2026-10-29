import type { Zone, LatLng, ZoneType } from '../types';

export interface GeofenceResult {
  currentZone: Zone | null;
  distanceToNearestMeters: number;
  nearestZone: Zone;
  zoneAdvisory: string;
  isInsideRestricted: boolean;
  isInsideCaution: boolean;
}

export const OFFICIAL_ZONES: Zone[] = [
  {
    id: 'zone-delhi-01',
    name: 'India Gate & Kartavya Path Corridor',
    type: 'safe',
    description: 'High-security central heritage zone with round-the-clock tourist police kiosks and high-definition CCTV coverage.',
    center: { lat: 28.6129, lng: 77.2295 },
    radiusMeters: 1500
  },
  {
    id: 'zone-delhi-02',
    name: 'Red Fort & Chandni Chowk Transit Hub',
    type: 'caution',
    description: 'Dense historical commercial market with high foot traffic. Prone to pickpocketing and congested non-vehicular alleys.',
    center: { lat: 28.6562, lng: 77.2410 },
    radiusMeters: 2200
  },
  {
    id: 'zone-delhi-03',
    name: 'Ridge Forest Ecological Buffer',
    type: 'restricted',
    description: 'Ecologically sensitive unlit forest fringe with zero tourist security infrastructure after dusk. Unauthorized night entry prohibited.',
    center: { lat: 28.6942, lng: 77.2085 },
    radiusMeters: 3000
  },
  {
    id: 'zone-delhi-04',
    name: 'Qutub Minar Archaeological Complex',
    type: 'safe',
    description: 'UNESCO World Heritage monument with designated ASI security guides and prepaid taxi booths.',
    center: { lat: 28.5245, lng: 77.1855 },
    radiusMeters: 1200
  }
];

export class GeofenceService {
  /**
   * Calculate distance between two GPS coordinates using the Haversine formula (in meters)
   */
  public static calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  /**
   * Determine the user's active zone and proximity to perimeters
   */
  public static evaluateGeofence(userLocation: LatLng, zones: Zone[] = OFFICIAL_ZONES): GeofenceResult {
    let currentZone: Zone | null = null;
    let nearestZone: Zone = zones[0];
    let minDistance = Infinity;

    for (const zone of zones) {
      const dist = this.calculateDistanceMeters(userLocation, zone.center);

      if (dist < minDistance) {
        minDistance = dist;
        nearestZone = zone;
      }

      // If user is within the radius of this zone
      if (dist <= zone.radiusMeters) {
        // Restricted and caution take priority over safe if overlapping
        if (!currentZone || (zone.type === 'restricted' && currentZone.type !== 'restricted')) {
          currentZone = zone;
        } else if (!currentZone || (zone.type === 'caution' && currentZone.type === 'safe')) {
          currentZone = zone;
        } else if (!currentZone) {
          currentZone = zone;
        }
      }
    }

    let advisory = 'Normal Tourist Safety Perimeter. Maintain general travel vigilance.';
    if (currentZone?.type === 'restricted') {
      advisory = 'RESTRICTED PERIMETER: You have entered an unpatrolled forest buffer. Exit immediately or contact Tourist Police (1363).';
    } else if (currentZone?.type === 'caution') {
      advisory = 'CAUTION ZONE: Congested market area. Keep valuables secured and avoid unlit alleys after dusk.';
    } else if (currentZone?.type === 'safe') {
      advisory = 'ACTIVE SAFE ZONE: Continuous tourist security patrol and CCTV surveillance active.';
    }

    return {
      currentZone,
      distanceToNearestMeters: minDistance,
      nearestZone,
      zoneAdvisory: advisory,
      isInsideRestricted: currentZone?.type === 'restricted',
      isInsideCaution: currentZone?.type === 'caution'
    };
  }
}
