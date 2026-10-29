import React, { useState, useMemo } from 'react';
import type { Zone, LatLng, UiIncident } from '../../types';
import { OFFICIAL_ZONES } from '../../services/geofenceService';
import {
  Compass,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Layers,
  Info
} from 'lucide-react';

export interface ZoneRadarMapProps {
  userLocation: LatLng | null;
  zones?: Zone[];
  incidents?: UiIncident[];
  onSelectZone?: (zone: Zone) => void;
  selectedZoneId?: string;
}

export const ZoneRadarMap: React.FC<ZoneRadarMapProps> = ({
  userLocation,
  zones = OFFICIAL_ZONES,
  incidents = [],
  onSelectZone,
  selectedZoneId
}) => {
  const [zoom, setZoom] = useState(1);
  const [showZones, setShowZones] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Map center: user location or India Gate Delhi
  const center = useMemo(() => {
    return userLocation || { lat: 28.6129, lng: 77.2295 };
  }, [userLocation]);

  // Viewport bounds calculation for SVG mapping
  // Map span roughly 0.25 degrees (~25km)
  const mapSpan = 0.22 / zoom;

  const projectToSvg = (point: LatLng, width = 600, height = 450) => {
    // Mercator-like linear projection for local area
    const x = ((point.lng - (center.lng - mapSpan / 2)) / mapSpan) * width;
    const y = (((center.lat + mapSpan / 2) - point.lat) / mapSpan) * height;
    return { x, y };
  };

  const getRadiusInSvgPixels = (radiusMeters: number, height = 450) => {
    // ~111,000 meters per degree latitude
    const degreesSpan = radiusMeters / 111000;
    return (degreesSpan / mapSpan) * height;
  };

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl text-white select-none">
      {/* Top Map Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-700/80 shadow flex items-center gap-2 text-xs">
          <Compass className="w-4 h-4 text-safety-400 animate-spin-slow" />
          <span className="font-bold tracking-tight text-white">Geofenced Safety Perimeters</span>
          <span className="text-[10px] font-mono text-slate-400">Offline Vector Engine</span>
        </div>

        {/* Map Layers & Zoom controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.3, 2.5))}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.3, 0.7))}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Reset Centering"
            className="p-1.5 hover:bg-slate-800 rounded-xl text-safety-400 transition"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative flex items-center justify-center overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Radar concentric range rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[30%] aspect-square rounded-full border border-safety-400/40" />
          <div className="absolute w-[60%] aspect-square rounded-full border border-safety-400/30" />
          <div className="absolute w-[90%] aspect-square rounded-full border border-safety-400/20" />
        </div>

        <svg
          viewBox="0 0 600 450"
          className="w-full h-full relative z-10"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 1. Render Geofenced Safety Zones */}
          {showZones &&
            zones.map((zone) => {
              const { x, y } = projectToSvg(zone.center);
              const r = getRadiusInSvgPixels(zone.radiusMeters);
              const isSelected = selectedZoneId === zone.id;

              const colors = {
                safe: {
                  fill: 'rgba(16, 185, 129, 0.15)',
                  stroke: 'rgba(16, 185, 129, 0.7)',
                  text: '#34d399'
                },
                caution: {
                  fill: 'rgba(245, 158, 11, 0.15)',
                  stroke: 'rgba(245, 158, 11, 0.7)',
                  text: '#fbbf24'
                },
                restricted: {
                  fill: 'rgba(239, 68, 68, 0.2)',
                  stroke: 'rgba(239, 68, 68, 0.8)',
                  text: '#f87171'
                }
              };

              const style = colors[zone.type];

              return (
                <g
                  key={zone.id}
                  className="cursor-pointer transition-transform hover:opacity-90"
                  onClick={() => onSelectZone && onSelectZone(zone)}
                  onMouseEnter={() => setActiveTooltip(zone.name)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {/* Zone Perimeter Circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r={Math.max(r, 15)}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={zone.type === 'restricted' ? '4 2' : undefined}
                  />

                  {/* Zone Center Marker */}
                  <circle cx={x} cy={y} r={4} fill={style.text} />

                  {/* Zone Label */}
                  <text
                    x={x}
                    y={y - Math.max(r, 15) - 6}
                    fill={style.text}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none shadow"
                  >
                    {zone.name.split(' ')[0]} ({zone.type.toUpperCase()})
                  </text>
                </g>
              );
            })}

          {/* 2. Render Incident Markers */}
          {showIncidents &&
            incidents.map((inc) => {
              const { x, y } = projectToSvg(inc.location);
              const isSos = inc.type === 'sos';

              return (
                <g
                  key={inc.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveTooltip(`Incident: ${inc.type.toUpperCase()} (${inc.status})`)}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  {isSos && (
                    <circle cx={x} cy={y} r={12} fill="rgba(220, 38, 38, 0.4)" className="animate-ping" />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSos ? 6 : 4.5}
                    fill={isSos ? '#ef4444' : '#f59e0b'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}

          {/* 3. Render User Live Position */}
          {userLocation && (
            (() => {
              const { x, y } = projectToSvg(userLocation);
              return (
                <g className="user-position-marker">
                  {/* Accuracy pulse ring */}
                  <circle
                    cx={x}
                    cy={y}
                    r={20}
                    fill="rgba(56, 189, 248, 0.2)"
                    className="animate-pulse"
                  />
                  {/* Blue User Dot */}
                  <circle cx={x} cy={y} r={7} fill="#0284c7" stroke="#ffffff" strokeWidth={2} />
                  <text
                    x={x}
                    y={y + 18}
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    YOU (GPS FIX)
                  </text>
                </g>
              );
            })()
          )}
        </svg>

        {/* Hover Tooltip display */}
        {activeTooltip && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-xl">
            {activeTooltip}
          </div>
        )}
      </div>

      {/* Map Legend Footer */}
      <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Safe Heritage Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Caution Congestion Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Restricted Night Perimeter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span>Your Live GPS Marker</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showZones}
              onChange={(e) => setShowZones(e.target.checked)}
              className="rounded border-slate-700 text-safety-500"
            />
            <span>Zones</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="rounded border-slate-700 text-safety-500"
            />
            <span>Incidents</span>
          </label>
        </div>
      </div>
    </div>
  );
};
