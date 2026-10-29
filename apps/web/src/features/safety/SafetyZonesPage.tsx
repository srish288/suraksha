import React, { useState } from 'react';
import { AlertTriangle, Info, LocateFixed, MapPin, RefreshCw, X } from 'lucide-react';
import { distanceToZoneMeters, type LatLng, type Zone } from '@suraksha/shared';
import { SafetyMap } from './SafetyMap';
import { SafetyLegend } from './SafetyLegend';
import { useZones } from './useZones';
import { useSafetyLocation, type LocationStatus } from './useSafetyLocation';
import { useSafetyAssessment } from './useSafetyAssessment';
import { RISK_COLORS, ZONE_COLORS, ZONE_LABELS, ZONE_MEANINGS } from './zoneStyle';

const CARD = 'bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl';
const BTN =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition';

function locationMessage(status: LocationStatus, message: string | null): string {
  switch (status) {
    case 'idle':
      return 'Location is off. Tap "Use my location" to see yourself on the map.';
    case 'requesting':
      return 'Waiting for your browser permission and a location fix...';
    case 'tracking':
      return 'Showing your live position while this page stays open.';
    case 'manual':
      return 'Using the spot you picked on the map. This is not your real GPS position.';
    case 'denied':
    case 'unavailable':
      return message ?? 'Location is not available. You can pick a spot on the map.';
  }
}

export const SafetyZonesPage: React.FC = () => {
  const { zones, loading, error, reload } = useZones();
  const loc = useSafetyLocation();
  const { geofence, risk, safetyAlert, dismissAlert } = useSafetyAssessment(loc.position, zones);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickMode, setPickMode] = useState(false);

  const selected: Zone | null = zones.find((z) => z.id === selectedId) ?? null;
  const hasSamples = zones.some((z) => z.isSample);
  const primary = geofence?.primary ?? null;
  const tracking = loc.status === 'tracking' || loc.status === 'requesting';

  const distanceToSelected =
    selected && loc.position ? Math.round(distanceToZoneMeters(loc.position, selected)) : null;

  const handlePick = (point: LatLng) => {
    loc.setManualPosition(point);
    setPickMode(false);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className={CARD}>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Safety Zones</h1>
        <p className="text-xs text-slate-400 mt-1">
          See safety zones on the map, get a warning when you enter or get close to one, and see a
          simple risk level with reasons.
        </p>
        {hasSamples && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-200">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>These are fictional demo zones. They are not official safety information.</span>
          </div>
        )}
      </div>

      {/* Location controls */}
      <div className={`${CARD} space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          {tracking ? (
            <button
              type="button"
              onClick={loc.stopTracking}
              className={`${BTN} border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800`}
            >
              Stop tracking
            </button>
          ) : (
            <button
              type="button"
              onClick={loc.startTracking}
              className={`${BTN} border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20`}
            >
              <LocateFixed className="w-4 h-4" />
              Use my location
            </button>
          )}
          <button
            type="button"
            onClick={() => setPickMode((p) => !p)}
            className={`${BTN} ${
              pickMode
                ? 'border-amber-500/60 bg-amber-500/20 text-amber-200'
                : 'border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {pickMode ? 'Now tap the map to choose a spot' : 'Pick a spot on the map'}
          </button>
        </div>

        <p className="text-xs text-slate-300">{locationMessage(loc.status, loc.message)}</p>
        {loc.status === 'tracking' && loc.accuracyMeters !== null && (
          <p className="text-[11px] text-slate-400">GPS accuracy: about {loc.accuracyMeters} m</p>
        )}
        <p className="text-[11px] text-slate-500">
          Your browser shares location only while this page is open. Browsers can pause location in
          the background or when the screen is off, so warnings are not guaranteed. In an
          emergency, contact local emergency services directly.
        </p>
      </div>

      {/* One-time alert */}
      {safetyAlert && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border p-4 text-slate-100"
          style={{
            borderColor: ZONE_COLORS[safetyAlert.zoneType],
            backgroundColor: `${ZONE_COLORS[safetyAlert.zoneType]}26`
          }}
        >
          <AlertTriangle
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: ZONE_COLORS[safetyAlert.zoneType] }}
          />
          <div className="text-xs flex-1">
            <p className="font-bold uppercase tracking-wider text-[11px]">{safetyAlert.title}</p>
            <p className="mt-0.5 leading-relaxed">{safetyAlert.message}</p>
            <p className="mt-1 text-[10px] text-slate-400">
              {new Date(safetyAlert.at).toLocaleTimeString()}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissAlert}
            aria-label="Dismiss alert"
            className="p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current zone and risk */}
      {risk && (
        <div className={`${CARD} space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Where you are
              </span>
              <p className="text-sm font-bold text-white">
                {primary
                  ? `${primary.status === 'inside' ? 'Inside' : 'Near'} "${primary.zone.name}"`
                  : 'Not inside or near any known zone'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk level</span>
              <span
                className="inline-block rounded-lg px-2.5 py-1 text-xs font-black uppercase text-white"
                style={{ backgroundColor: RISK_COLORS[risk.level] }}
              >
                {risk.level} ({risk.score}/100)
              </span>
            </div>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300">
            {risk.factors.map((f, i) => (
              <li key={`${f.code}-${i}`} className="rounded-xl bg-slate-950 border border-slate-800 p-2.5">
                <span className="font-bold text-white">{f.label}</span>
                <span className="text-slate-400"> (+{f.points})</span>
                <p className="text-slate-400 mt-0.5">{f.reason}</p>
              </li>
            ))}
          </ul>

          <p className="text-[11px] text-slate-500">
            This is a simple rule-based score using your position and the zones. It is not a
            prediction and not a trained model.
            {risk.assessedAt ? ` Checked at ${new Date(risk.assessedAt).toLocaleTimeString()}.` : ''}
          </p>
        </div>
      )}

      {/* Map */}
      <div className={`${CARD} space-y-3`}>
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={reload}
              className={`${BTN} border-rose-500/50 text-rose-100 hover:bg-rose-500/20`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        )}
        {loading && <p className="text-xs text-slate-400">Loading zones...</p>}

        <SafetyMap
          zones={zones}
          position={loc.position}
          accuracyMeters={loc.accuracyMeters}
          selectedZoneId={selectedId}
          pickMode={pickMode}
          onSelectZone={setSelectedId}
          onPick={handlePick}
        />
        <SafetyLegend showSampleNote={hasSamples} />
      </div>

      {/* Zone details and list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={`md:col-span-2 ${CARD} space-y-3`}>
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">{selected.name}</h2>
                <span
                  className="rounded-lg px-2.5 py-1 text-[11px] font-black uppercase text-white shrink-0"
                  style={{ backgroundColor: ZONE_COLORS[selected.type] }}
                >
                  {ZONE_LABELS[selected.type]}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selected.description}</p>
              <p className="text-xs text-slate-400">{ZONE_MEANINGS[selected.type]}</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>
                  Shape:{' '}
                  {selected.polygon && selected.polygon.length >= 3
                    ? `area with ${selected.polygon.length} corners`
                    : `circle, radius ${selected.radiusMeters} m`}
                </li>
                <li>
                  Early warning:{' '}
                  {(selected.alertDistanceMeters ?? 0) > 0 && selected.type !== 'safe'
                    ? `within ${selected.alertDistanceMeters} m of the edge`
                    : 'none'}
                </li>
                <li>Status: {selected.active === false ? 'switched off' : 'active'}</li>
                {distanceToSelected !== null && (
                  <li className="text-slate-200">
                    {distanceToSelected === 0
                      ? 'You are inside this zone.'
                      : `You are about ${distanceToSelected} m from this zone.`}
                  </li>
                )}
              </ul>
              {selected.isSample && (
                <p className="text-[11px] italic text-amber-300">
                  Fictional demo zone. Not official safety information.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-400">
              Tap a zone on the map or in the list to see its details.
            </p>
          )}
        </div>

        <div className={`${CARD} space-y-2`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Zones ({zones.length})
          </h3>
          {zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setSelectedId(zone.id)}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition ${
                zone.id === selectedId
                  ? 'border-cyan-500 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: ZONE_COLORS[zone.type] }}
              />
              <span className="truncate flex-1">{zone.name}</span>
              <span className="text-[10px] text-slate-400">{ZONE_LABELS[zone.type]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};