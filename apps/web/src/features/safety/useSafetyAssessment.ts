import { useEffect, useMemo, useRef, useState } from 'react';
import {
  assessRisk,
  createAlertTracker,
  evaluatePosition,
  type GeofenceResult,
  type LatLng,
  type RiskAssessment,
  type Zone,
  type ZoneStatus,
  type ZoneType
} from '@suraksha/shared';

export interface SafetyAlert {
  zoneType: ZoneType;
  title: string;
  message: string;
  at: string;
}

function buildAlertText(zone: Zone, status: ZoneStatus, distanceMeters: number) {
  if (status === 'near') {
    return {
      title: `Approaching a ${zone.type} zone`,
      message: `You are about ${Math.round(distanceMeters)} m from "${zone.name}". ${zone.description}`
    };
  }

  const titles: Record<ZoneType, string> = {
    safe: 'Safe zone',
    caution: 'Caution zone',
    restricted: 'Restricted zone',
    emergency: 'Emergency zone'
  };
  const advice: Record<ZoneType, string> = {
    safe: '',
    caution: 'Stay alert and take extra care.',
    restricted: 'Leave this area if you can do so safely.',
    emergency: 'Move away from the danger and follow instructions from local authorities.'
  };

  return {
    title: titles[zone.type],
    message: `You are inside "${zone.name}". ${zone.description} ${advice[zone.type]}`.trim()
  };
}

// Works out the zone + risk for a position, and raises ONE alert when the
// tourist enters or approaches a new zone (no repeat while they stay in it).
export function useSafetyAssessment(position: LatLng | null, zones: Zone[]) {
  const trackerRef = useRef(createAlertTracker());
  const [safetyAlert, setSafetyAlert] = useState<SafetyAlert | null>(null);

  const geofence = useMemo<GeofenceResult | null>(
    () => (position ? evaluatePosition(position, zones) : null),
    [position, zones]
  );

  const risk = useMemo<RiskAssessment | null>(
    () => (position ? assessRisk(position, zones) : null),
    [position, zones]
  );

  useEffect(() => {
    const shouldAlert = trackerRef.current.check(geofence, Date.now());
    const primary = geofence?.primary ?? null;

    if (shouldAlert && primary) {
      const text = buildAlertText(primary.zone, primary.status, primary.distanceMeters);
      setSafetyAlert({ zoneType: primary.zone.type, ...text, at: new Date().toISOString() });
    } else if (!primary || primary.zone.type === 'safe') {
      setSafetyAlert(null);
    }
  }, [geofence]);

  return {
    geofence,
    risk,
    safetyAlert,
    dismissAlert: () => setSafetyAlert(null)
  };
}