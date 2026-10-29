import React, { useState, useEffect } from 'react';
import { LocationService } from '../services/locationService';
import { GeofenceService, OFFICIAL_ZONES, type GeofenceResult } from '../services/geofenceService';
import { IncidentService } from '../services/incidentService';
import { ZoneRadarMap } from '../components/map/ZoneRadarMap';
import { SpatialSafetyGlobe } from '../components/3d/SpatialSafetyGlobe';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import type { Zone, LatLng, UiIncident, LocationState } from '../types';
import {
  Compass,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  Navigation,
  Sparkles,
  Info
} from 'lucide-react';

export const SafetyZonesMapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationState, setLocationState] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    timestamp: null,
    status: 'idle'
  });
  const [selectedZone, setSelectedZone] = useState<Zone>(OFFICIAL_ZONES[0]);
  const [geofenceResult, setGeofenceResult] = useState<GeofenceResult | null>(null);
  const [incidents, setIncidents] = useState<UiIncident[]>([]);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const fetchLivePosition = async () => {
    setLocationState((prev) => ({ ...prev, status: 'requesting' }));
    const loc = await LocationService.getLiveLocation();
    setLocationState(loc);

    const coords: LatLng =
      loc.lat && loc.lng ? { lat: loc.lat, lng: loc.lng } : LocationService.getPresetCoordinates('delhi');
    setUserLocation(coords);

    const result = GeofenceService.evaluateGeofence(coords);
    setGeofenceResult(result);
    if (result.currentZone) {
      setSelectedZone(result.currentZone);
    }
  };

  const handleSimulatePosition = (presetCity: string) => {
    const coords = LocationService.getPresetCoordinates(presetCity);
    setUserLocation(coords);
    setLocationState({
      lat: coords.lat,
      lng: coords.lng,
      accuracy: 10,
      timestamp: Date.now(),
      status: 'granted'
    });

    const result = GeofenceService.evaluateGeofence(coords);
    setGeofenceResult(result);
    if (result.currentZone) {
      setSelectedZone(result.currentZone);
    }
  };

  useEffect(() => {
    fetchLivePosition();
    IncidentService.getMyIncidents().then((res) => setIncidents(res.items));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Safety Zones &amp; Geofence Radar
            </h1>
            <p className="text-xs text-slate-400">
              Real-time situational boundary monitoring, safe tourist corridors, and restricted perimeters
            </p>
          </div>
        </div>

        {/* 1-Click Simulation Hotspots & Mode Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* 3D vs 2D View Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === '3d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3D Spatial Sphere
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === '2d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2D Tactical Radar
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSimulatePosition('delhi')}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition"
            >
              India Gate (Safe)
            </button>
            <button
              type="button"
              onClick={() => {
                const coords = { lat: 28.6562, lng: 77.241 };
                setUserLocation(coords);
                const res = GeofenceService.evaluateGeofence(coords);
                setGeofenceResult(res);
                if (res.currentZone) setSelectedZone(res.currentZone);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition"
            >
              Chandni Chowk (Caution)
            </button>
            <button
              type="button"
              onClick={() => {
                const coords = { lat: 28.6942, lng: 77.2085 };
                setUserLocation(coords);
                const res = GeofenceService.evaluateGeofence(coords);
                setGeofenceResult(res);
                if (res.currentZone) setSelectedZone(res.currentZone);
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 transition"
            >
              Ridge Forest (Restricted)
            </button>
          </div>
        </div>
      </div>

      {/* Geofence Active Alert Banner */}
      {geofenceResult && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 shadow-md ${
            geofenceResult.isInsideRestricted
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              : geofenceResult.isInsideCaution
              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {geofenceResult.isInsideRestricted ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          ) : geofenceResult.isInsideCaution ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block text-[11px]">
              Geofence Engine Trigger:{' '}
              {geofenceResult.currentZone
                ? `${geofenceResult.currentZone.name} (${geofenceResult.currentZone.type.toUpperCase()})`
                : 'Outside Designated Zone'}
            </span>
            <p className="mt-0.5 leading-relaxed text-slate-300">{geofenceResult.zoneAdvisory}</p>
          </div>
        </div>
      )}

      {/* 3D Spatial Globe vs 2D Radar View */}
      {viewMode === '3d' ? (
        <SpatialSafetyGlobe
          userLocation={locationState}
          incidents={incidents}
          selectedZoneId={selectedZone.id}
          onSelectZone={(sz) => {
            const matched = OFFICIAL_ZONES.find((z) => z.id === sz.id) || {
              id: sz.id,
              name: sz.name,
              type: sz.type,
              description: sz.description,
              center: { lat: 28.6315, lng: 77.2167 },
              radiusMeters: 1500
            };
            setSelectedZone(matched);
          }}
        />
      ) : (
        <ZoneRadarMap
          userLocation={userLocation}
          zones={OFFICIAL_ZONES}
          incidents={incidents}
          selectedZoneId={selectedZone.id}
          onSelectZone={(zone) => setSelectedZone(zone)}
        />
      )}

      {/* Selected Zone Inspector & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Selected Zone Details (2 cols) */}
        <div className="md:col-span-2 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge zone={selectedZone.type}>{selectedZone.type} zone</Badge>
                <span className="text-xs font-mono text-slate-400">ID: {selectedZone.id}</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">{selectedZone.name}</h2>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Perimeter Radius
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {(selectedZone.radiusMeters / 1000).toFixed(1)} km
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedZone.description}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] block">
              Zone Coordinates &amp; Nearest Support Post
            </span>
            <p className="font-mono text-slate-400">
              Center Latitude: {selectedZone.center.lat.toFixed(4)}°N | Longitude: {selectedZone.center.lng.toFixed(4)}°E
            </p>
            <p className="text-slate-300">
              Nearest Assistance: <strong className="text-white">Tourist Police Help Post ({selectedZone.name.split(' ')[0]})</strong>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Official Helpline: <strong className="text-white">1363 (Tourist Police)</strong></span>
            <a
              href="tel:1363"
              className="inline-flex items-center gap-1.5 font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

        {/* Zone Directory List (1 col) */}
        <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Perimeters ({OFFICIAL_ZONES.length})
          </h3>

          <div className="space-y-2">
            {OFFICIAL_ZONES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/40 shadow-sm ring-1 ring-cyan-500/40 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">
                      {zone.name.split(' ')[0]}
                    </span>
                    <Badge zone={zone.type}>{zone.type}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {zone.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
