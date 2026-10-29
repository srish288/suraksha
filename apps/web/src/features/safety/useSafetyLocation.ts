import { useCallback, useEffect, useRef, useState } from 'react';
import type { LatLng } from '@suraksha/shared';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'tracking'
  | 'manual'
  | 'denied'
  | 'unavailable';

// Browser location is asked for ONLY when startTracking() is called (a button tap).
// It runs only while the page is open. Browsers may pause it in the background.
export function useSafetyLocation() {
  const watchId = useRef<number | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const clearWatch = useCallback(() => {
    if (watchId.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchId.current);
    }
    watchId.current = null;
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      setMessage('This browser or device does not support location. You can pick a spot on the map.');
      return;
    }

    clearWatch();
    setStatus('requesting');
    setMessage(null);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracyMeters(Math.round(pos.coords.accuracy));
        setStatus('tracking');
        setMessage(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          clearWatch();
          setStatus('denied');
          setMessage('Location permission was denied. You can still pick a spot on the map.');
        } else {
          setStatus((s) => (s === 'tracking' ? s : 'unavailable'));
          setMessage('Could not get a location fix. Check that location is on, or pick a spot on the map.');
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );
  }, [clearWatch]);

  const stopTracking = useCallback(() => {
    clearWatch();
    setStatus('idle');
  }, [clearWatch]);

  const setManualPosition = useCallback(
    (point: LatLng) => {
      clearWatch();
      setPosition(point);
      setAccuracyMeters(null);
      setStatus('manual');
      setMessage(null);
    },
    [clearWatch]
  );

  // Stop the watch when the page is closed.
  useEffect(() => clearWatch, [clearWatch]);

  return {
    status,
    position,
    accuracyMeters,
    message,
    startTracking,
    stopTracking,
    setManualPosition
  };
}