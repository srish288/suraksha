import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { SAMPLE_ZONES } from '../../services/mockData';
import { GeofenceService } from '../../services/geofenceService';
import { ZoneRadarMap } from '../map/ZoneRadarMap';
import type { LocationState, UiIncident, SafetyZoneInfo } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  Compass,
  Maximize2,
  Minimize2,
  RotateCw,
  Eye,
  Layers,
  MapPin,
  Info,
  PhoneCall,
  Activity
} from 'lucide-react';

export interface SpatialSafetyGlobeProps {
  userLocation: LocationState;
  incidents: UiIncident[];
  selectedZoneId?: string;
  onSelectZone?: (zone: SafetyZoneInfo) => void;
  onSelectIncident?: (incident: UiIncident) => void;
  className?: string;
}

interface MarkerData {
  id: string;
  type: 'zone' | 'incident' | 'user';
  name: string;
  category: string;
  lat: number;
  lng: number;
  status?: string;
  zoneInfo?: SafetyZoneInfo;
  incidentInfo?: UiIncident;
  distanceMeters?: number;
}

// Convert Geo coordinates (lat, lng) to 3D Cartesian coordinates (x, y, z) on a sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

export const SpatialSafetyGlobe: React.FC<SpatialSafetyGlobeProps> = ({
  userLocation,
  incidents,
  selectedZoneId,
  onSelectZone,
  onSelectIncident,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // States
  const [isWebGLSupported, setIsWebGLSupported] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [activeMarker, setActiveMarker] = useState<MarkerData | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [cameraDistance, setCameraDistance] = useState<number>(3.2);

  // User coordinates fallback (Delhi center)
  const userLat = userLocation.lat ?? 28.6304;
  const userLng = userLocation.lng ?? 77.2177;

  // Reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // WebGL support check
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setIsWebGLSupported(supported);
    } catch {
      setIsWebGLSupported(false);
    }
  }, []);

  // Three.js Scene Setup & Animation Loop
  useEffect(() => {
    if (!isWebGLSupported || viewMode !== '3d' || !containerRef.current || !canvasRef.current) {
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.6, cameraDistance);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // 2. Lighting (Command Center Style)
    const ambientLight = new THREE.AmbientLight(0x0a192f, 2.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const secondaryLight = new THREE.PointLight(0x06b6d4, 3, 10);
    secondaryLight.position.set(-4, -2, -3);
    scene.add(secondaryLight);

    // 3. Globe Group & Surface
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 1.35;

    // Core Dark Command Sphere
    const sphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 48, 48);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x070e1c,
      emissive: 0x030712,
      specular: 0x1e3a8a,
      shininess: 25,
      transparent: true,
      opacity: 0.96
    });
    const globeSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    globeGroup.add(globeSphere);

    // Wireframe Latitude & Longitude Navigation Rings
    const wireframeGeometry = new THREE.WireframeGeometry(
      new THREE.SphereGeometry(GLOBE_RADIUS * 1.002, 24, 24)
    );
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x0e7490,
      transparent: true,
      opacity: 0.22
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    globeGroup.add(wireframe);

    // Outer Atmospheric Fresnel Glow Ring
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.08, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);

    // Equatorial & Tactical Orbit Rings
    const orbitRingGeom = new THREE.RingGeometry(GLOBE_RADIUS * 1.25, GLOBE_RADIUS * 1.255, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2
    });
    const orbitRing = new THREE.Mesh(orbitRingGeom, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    globeGroup.add(orbitRing);

    // 4. Interactive Marker Objects Collection
    const markerObjects: Array<{
      mesh: THREE.Object3D;
      data: MarkerData;
    }> = [];

    // Helper: Create 3D Spatial Zone Ring
    const addZoneMarker = (zone: SafetyZoneInfo, lat: number, lng: number) => {
      const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.01);
      const normal = pos.clone().normalize();

      const color =
        zone.type === 'safe' ? 0x10b981 : zone.type === 'caution' ? 0xf59e0b : 0xef4444;

      const zoneGroup = new THREE.Group();
      zoneGroup.position.copy(pos);
      zoneGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Inner Pulse Disc
      const discGeom = new THREE.CircleGeometry(0.045, 24);
      const discMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide
      });
      const disc = new THREE.Mesh(discGeom, discMat);
      zoneGroup.add(disc);

      // Outer Perimeter Ring
      const ringGeom = new THREE.RingGeometry(0.065, 0.075, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      zoneGroup.add(ring);

      // Vertical Target Pin
      const pinGeom = new THREE.CylinderGeometry(0.004, 0.001, 0.08, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.z = 0.04;
      pin.rotation.x = Math.PI / 2;
      zoneGroup.add(pin);

      globeGroup.add(zoneGroup);

      const distance = GeofenceService.calculateDistanceMeters(
        { lat: userLat, lng: userLng },
        { lat, lng }
      );

      markerObjects.push({
        mesh: disc,
        data: {
          id: zone.id,
          type: 'zone',
          name: zone.name,
          category: `${zone.type.toUpperCase()} ZONE`,
          lat,
          lng,
          zoneInfo: zone,
          distanceMeters: distance
        }
      });
    };

    // Add Delhi Safety Zones
    if (showZones) {
      addZoneMarker(SAMPLE_ZONES[0], 28.6315, 77.2167); // Safe Zone: Connaught Place
      addZoneMarker(SAMPLE_ZONES[1], 28.643, 77.215); // Caution Zone: Pahar Ganj
      addZoneMarker(SAMPLE_ZONES[2], 28.6562, 77.241); // Restricted Zone: Old Delhi
    }

    // Helper: Add Tourist Live Location Beacon
    const addTouristMarker = (lat: number, lng: number) => {
      const pos = latLngToVector3(lat, lng, GLOBE_RADIUS * 1.015);
      const normal = pos.clone().normalize();

      const userGroup = new THREE.Group();
      userGroup.position.copy(pos);
      userGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

      // Concentric Cyan Rings
      const ringGeom = new THREE.RingGeometry(0.04, 0.052, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      userGroup.add(ring);

      // Central Luminous Core
      const coreGeom = new THREE.CircleGeometry(0.025, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      userGroup.add(core);

      // Vertical Beacon Line
      const beaconLineGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.12, 6);
      const beaconLineMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.8
      });
      const beaconLine = new THREE.Mesh(beaconLineGeom, beaconLineMat);
      beaconLine.position.z = 0.06;
      beaconLine.rotation.x = Math.PI / 2;
      userGroup.add(beaconLine);

      globeGroup.add(userGroup);

      markerObjects.push({
        mesh: core,
        data: {
          id: 'tourist-user-pos',
          type: 'user',
          name: 'Your Current Live Fix',
          category: 'TOURIST BEACON',
          lat,
          lng,
          status: 'ACTIVE GPS FIX',
          distanceMeters: 0
        }
      });
    };

    addTouristMarker(userLat, userLng);

    // Helper: Add Real/Demo Incident Markers
    if (showIncidents && incidents.length > 0) {
      incidents.slice(0, 8).forEach((inc) => {
        const incLat = inc.location?.lat ?? userLat + (Math.random() - 0.5) * 0.03;
        const incLng = inc.location?.lng ?? userLng + (Math.random() - 0.5) * 0.03;

        const pos = latLngToVector3(incLat, incLng, GLOBE_RADIUS * 1.012);
        const normal = pos.clone().normalize();

        const incGroup = new THREE.Group();
        incGroup.position.copy(pos);
        incGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

        const incColor =
          inc.type === 'sos' ? 0xdc2626 : inc.severity === 'critical' ? 0xef4444 : 0xf59e0b;

        const incDiscGeom = new THREE.CircleGeometry(0.035, 18);
        const incDiscMat = new THREE.MeshBasicMaterial({
          color: incColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9
        });
        const incDisc = new THREE.Mesh(incDiscGeom, incDiscMat);
        incGroup.add(incDisc);

        globeGroup.add(incGroup);

        const distance = GeofenceService.calculateDistanceMeters(
          { lat: userLat, lng: userLng },
          { lat: incLat, lng: incLng }
        );

        markerObjects.push({
          mesh: incDisc,
          data: {
            id: inc.id,
            type: 'incident',
            name: `${inc.type.toUpperCase()}: ${inc.description.slice(0, 24)}...`,
            category: `INCIDENT (${inc.status.toUpperCase()})`,
            lat: incLat,
            lng: incLng,
            status: inc.status,
            incidentInfo: inc,
            distanceMeters: distance
          }
        });
      });
    }

    // Orient Globe initially towards Delhi Region
    const initialTargetPos = latLngToVector3(userLat, userLng, GLOBE_RADIUS);
    globeGroup.rotation.y = -userLng * (Math.PI / 180) - Math.PI / 2;
    globeGroup.rotation.x = userLat * (Math.PI / 180) * 0.4;

    // 5. Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;

        // Clamp vertical tilt
        globeGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, globeGroup.rotation.x));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch Support for Mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        globeGroup.rotation.y += deltaX * 0.006;
        globeGroup.rotation.x += deltaY * 0.006;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    // Raycast Click Handler
    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const meshesToIntersect = markerObjects.map((m) => m.mesh);
      const intersects = raycaster.intersectObjects(meshesToIntersect, true);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const matched = markerObjects.find(
          (m) => m.mesh === hitMesh || m.mesh.children.includes(hitMesh)
        );

        if (matched) {
          setActiveMarker(matched.data);
          if (matched.data.zoneInfo && onSelectZone) {
            onSelectZone(matched.data.zoneInfo);
          }
          if (matched.data.incidentInfo && onSelectIncident) {
            onSelectIncident(matched.data.incidentInfo);
          }
        }
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('click', onClick);

    // Resize Handler
    const onResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 6. Animation Render Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth slow auto-rotation if not dragging and motion is permitted
      if (isAutoRotating && !isDragging && !prefersReducedMotion) {
        globeGroup.rotation.y += 0.0018;
      }

      // Orbital pulse effect
      orbitRing.rotation.z += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('click', onClick);

      // Dispose 3D elements
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      orbitRingGeom.dispose();
      orbitRingMat.dispose();
      renderer.dispose();
    };
  }, [
    isWebGLSupported,
    viewMode,
    isAutoRotating,
    prefersReducedMotion,
    userLat,
    userLng,
    showZones,
    showIncidents,
    cameraDistance,
    incidents
  ]);

  // Fallback to 2D Radar Map if WebGL is unsupported or user switches to 2D
  if (!isWebGLSupported || viewMode === '2d') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Toggle Bar */}
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">
              Tactical Perimeter Radar (2D Mode)
            </span>
          </div>
          {isWebGLSupported && (
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition"
            >
              Switch to 3D Spatial Globe
            </button>
          )}
        </div>
        <ZoneRadarMap
          userLocation={
            userLocation.lat !== null && userLocation.lng !== null
              ? { lat: userLocation.lat, lng: userLocation.lng }
              : null
          }
          selectedZoneId={selectedZoneId}
          onSelectZone={(z) => {
            if (onSelectZone) {
              const matched = SAMPLE_ZONES.find((sz) => sz.id === z.id) || {
                id: z.id,
                name: z.name,
                type: z.type,
                description: z.description || '',
                advisory: 'Advisory updated from perimeter',
                helpline: '112',
                policeStation: 'Nearest Division'
              };
              onSelectZone(matched);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl h-[440px] sm:h-[500px] select-none ${className}`}
    >
      {/* Three.js Canvas Element */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top Header Tactical Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-lg pointer-events-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
            3D Spatial Safety Radar
          </span>
          <span className="text-[9px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
            {userLat.toFixed(3)}°N, {userLng.toFixed(3)}°E
          </span>
        </div>

        {/* View Controls Toolbar */}
        <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-2xl border border-slate-800 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsAutoRotating((prev) => !prev)}
            title={isAutoRotating ? 'Pause Rotation' : 'Resume Auto-Rotation'}
            className={`p-1.5 rounded-xl text-xs transition ${
              isAutoRotating
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin-slow' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowZones((prev) => !prev)}
            title="Toggle Safety Zones"
            className={`p-1.5 rounded-xl text-xs transition ${
              showZones
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowIncidents((prev) => !prev)}
            title="Toggle Incidents"
            className={`p-1.5 rounded-xl text-xs transition ${
              showIncidents
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            title="Switch to 2D Tactical View"
            className="px-2 py-1 rounded-xl text-[10px] font-bold text-slate-300 hover:bg-slate-800 transition"
          >
            2D Radar
          </button>
        </div>
      </div>

      {/* Floating Instructions Pill */}
      <div className="absolute top-14 left-4 pointer-events-none hidden sm:block">
        <p className="text-[10px] text-slate-400 bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800/60">
          Drag to rotate globe • Click marker for telemetry
        </p>
      </div>

      {/* Selected Marker Telemetry HUD Panel (Connected to click) */}
      {activeMarker && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-4 shadow-2xl text-left space-y-2.5 animate-fadeIn">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-wider">
                {activeMarker.category}
              </span>
              <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                {activeMarker.name}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setActiveMarker(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition text-xs"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Distance</span>
              <span className="font-bold font-mono text-cyan-300">
                {activeMarker.distanceMeters !== undefined
                  ? `${(activeMarker.distanceMeters / 1000).toFixed(2)} km`
                  : 'Near Fix'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Coordinates</span>
              <span className="font-bold font-mono text-slate-300 truncate block">
                {activeMarker.lat.toFixed(4)}, {activeMarker.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {activeMarker.zoneInfo && (
            <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60 text-[11px]">
              <p className="text-slate-300 leading-relaxed text-xs">
                {activeMarker.zoneInfo.advisory}
              </p>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>Nearest Post: {activeMarker.zoneInfo.policeStation}</span>
                <a
                  href={`tel:${activeMarker.zoneInfo.helpline}`}
                  className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" /> Call {activeMarker.zoneInfo.helpline}
                </a>
              </div>
            </div>
          )}

          {activeMarker.incidentInfo && (
            <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
              <p className="font-medium text-xs">{activeMarker.incidentInfo.description}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span>Severity: {activeMarker.incidentInfo.severity.toUpperCase()}</span>
                <span className="capitalize text-amber-400">
                  Status: {activeMarker.incidentInfo.status}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Status Legend Bar */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-xl border border-slate-800/80 pointer-events-none">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Safe
        </span>
        <span className="flex items-center gap-1 text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Caution
        </span>
        <span className="flex items-center gap-1 text-rose-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Restricted
        </span>
        <span className="flex items-center gap-1 text-cyan-400 font-medium ml-1">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> You
        </span>
      </div>
    </div>
  );
};
