import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LatLng, Zone } from '@suraksha/shared';
import { ZONE_COLORS, ZONE_LABELS } from './zoneStyle';

interface SafetyMapProps {
  zones: Zone[];
  position: LatLng | null;
  accuracyMeters: number | null;
  selectedZoneId: string | null;
  pickMode: boolean;
  onSelectZone: (zoneId: string) => void;
  onPick: (point: LatLng) => void;
}

const DEFAULT_CENTER: L.LatLngTuple = [28.6129, 77.2295];

// Popup content is built with textContent so zone text can never inject HTML.
function buildPopup(zone: Zone): HTMLElement {
  const root = document.createElement('div');
  root.style.maxWidth = '240px';

  const title = document.createElement('strong');
  title.textContent = zone.name;

  const level = document.createElement('div');
  level.textContent = `${ZONE_LABELS[zone.type]} zone`;
  level.style.color = ZONE_COLORS[zone.type];
  level.style.fontWeight = '700';

  const description = document.createElement('p');
  description.textContent = zone.description;
  description.style.margin = '6px 0';

  root.append(title, level, description);

  const alertDistance = zone.alertDistanceMeters ?? 0;
  if (alertDistance > 0 && zone.type !== 'safe') {
    const early = document.createElement('div');
    early.textContent = `Early warning within ${alertDistance} m of the edge`;
    early.style.fontSize = '12px';
    root.append(early);
  }

  if (zone.isSample) {
    const sample = document.createElement('div');
    sample.textContent = 'Fictional demo zone. Not official safety information.';
    sample.style.fontSize = '12px';
    sample.style.fontStyle = 'italic';
    root.append(sample);
  }

  return root;
}

export const SafetyMap: React.FC<SafetyMapProps> = ({
  zones,
  position,
  accuracyMeters,
  selectedZoneId,
  pickMode,
  onSelectZone,
  onPick
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const zoneGroupRef = useRef<L.LayerGroup | null>(null);
  const userGroupRef = useRef<L.LayerGroup | null>(null);
  const zoneLayersRef = useRef<Map<string, L.Path>>(new Map());
  const fittedRef = useRef(false);
  const centeredOnUserRef = useRef(false);

  // Latest props for the Leaflet event handlers (so the map is not rebuilt).
  const pickModeRef = useRef(pickMode);
  const onPickRef = useRef(onPick);
  const onSelectRef = useRef(onSelectZone);

  // 1. Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current).setView(DEFAULT_CENTER, 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    zoneGroupRef.current = L.layerGroup().addTo(map);
    userGroupRef.current = L.layerGroup().addTo(map);
    fittedRef.current = false;
    centeredOnUserRef.current = false;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (pickModeRef.current) {
        onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      zoneGroupRef.current = null;
      userGroupRef.current = null;
      zoneLayersRef.current.clear();
    };
  }, []);

  // 2. Keep the latest handlers and the cursor in sync.
  useEffect(() => {
    pickModeRef.current = pickMode;
    onPickRef.current = onPick;
    onSelectRef.current = onSelectZone;
    const map = mapRef.current;
    if (map) map.getContainer().style.cursor = pickMode ? 'crosshair' : '';
  });

  // 3. Draw the zones (polygon or circle) whenever they change.
  useEffect(() => {
    const map = mapRef.current;
    const group = zoneGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    zoneLayersRef.current.clear();
    const bounds = L.latLngBounds([]);

    for (const zone of zones) {
      const color = ZONE_COLORS[zone.type];
      const style: L.PathOptions = {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: zone.type === 'safe' ? 0.15 : 0.28,
        dashArray: zone.active === false ? '6 6' : undefined
      };

      let layer: L.Polygon | L.Circle;
      if (zone.polygon && zone.polygon.length >= 3) {
        layer = L.polygon(
          zone.polygon.map((p): L.LatLngTuple => [p.lat, p.lng]),
          style
        );
      } else {
        const center: L.LatLngTuple = [zone.center.lat, zone.center.lng];
        layer = L.circle(center, { ...style, radius: zone.radiusMeters });

        // Dashed outer ring = early-warning distance.
        const alertDistance = zone.alertDistanceMeters ?? 0;
        if (alertDistance > 0 && zone.type !== 'safe') {
          L.circle(center, {
            radius: zone.radiusMeters + alertDistance,
            color,
            weight: 1,
            dashArray: '4 6',
            fill: false,
            interactive: false
          }).addTo(group);
        }
      }

      layer.bindPopup(buildPopup(zone));
      layer.on('click', () => onSelectRef.current(zone.id));
      layer.addTo(group);
      zoneLayersRef.current.set(zone.id, layer);
      bounds.extend(layer.getBounds());
    }

    if (!fittedRef.current && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
      fittedRef.current = true;
    }
  }, [zones]);

  // 4. Thicker outline for the selected zone (does not close the popup).
  useEffect(() => {
    zoneLayersRef.current.forEach((layer, id) => {
      layer.setStyle({ weight: id === selectedZoneId ? 4 : 2 });
    });
  }, [selectedZoneId, zones]);

  // 5. Show the tourist's position.
  useEffect(() => {
    const map = mapRef.current;
    const group = userGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!position) return;

    const point: L.LatLngTuple = [position.lat, position.lng];

    if (accuracyMeters && accuracyMeters > 0) {
      L.circle(point, {
        radius: accuracyMeters,
        color: '#0284c7',
        weight: 1,
        fillOpacity: 0.1,
        interactive: false
      }).addTo(group);
    }

    L.circleMarker(point, {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#0284c7',
      fillOpacity: 1
    })
      .bindTooltip('You are here')
      .addTo(group);

    if (!centeredOnUserRef.current) {
      map.setView(point, Math.max(map.getZoom(), 15));
      centeredOnUserRef.current = true;
    }
  }, [position, accuracyMeters]);

  return <div ref={containerRef} className="relative z-0 h-[420px] w-full rounded-2xl overflow-hidden" />;
};