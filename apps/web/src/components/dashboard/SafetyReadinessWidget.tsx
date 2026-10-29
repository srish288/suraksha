import React, { useState, useEffect } from 'react';
import type { LocationState, TouristProfile, SafetyZoneInfo } from '../../types';
import { OfflineQueueService } from '../../services/offlineQueue';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Phone,
  Wifi,
  WifiOff,
  RefreshCw,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export interface SafetyReadinessWidgetProps {
  user: TouristProfile | null;
  locationState: LocationState;
  currentZone: SafetyZoneInfo;
  onRefreshLocation: () => void;
  onEditProfile: () => void;
  onSyncOffline: () => void;
}

export const SafetyReadinessWidget: React.FC<SafetyReadinessWidgetProps> = ({
  user,
  locationState,
  currentZone,
  onRefreshLocation,
  onEditProfile,
  onSyncOffline
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(OfflineQueueService.isOnline());
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleQueueChange = () => {
      setOfflinePendingCount(OfflineQueueService.getQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('suraksha_offline_queue_changed', handleQueueChange);

    handleQueueChange();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('suraksha_offline_queue_changed', handleQueueChange);
    };
  }, []);

  // Compute readiness score (out of 4)
  const isGpsReady = locationState.status === 'granted';
  const isGuardianLinked = !!user?.emergencyContact?.phone;
  const isNetworkReady = isOnline;
  const isZoneSafe = currentZone.type === 'safe';

  const readyItemsCount = [isGpsReady, isGuardianLinked, isNetworkReady, isZoneSafe].filter(Boolean).length;
  const readinessPercentage = Math.round((readyItemsCount / 4) * 100);

  return (
    <div className="bg-slate-900/90 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-2xl space-y-4">
      {/* Top Title & Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-950 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Tourist Safety Readiness &amp; Awareness
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time situational readiness &amp; geofence synchronization
            </p>
          </div>
        </div>

        {/* Readiness Meter */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
              READINESS INDEX
            </span>
            <span className="text-sm font-extrabold text-cyan-300 font-mono">
              {readinessPercentage}% ({readyItemsCount}/4 Active)
            </span>
          </div>
          <div className="w-10 h-10 rounded-full border border-cyan-500/40 flex items-center justify-center text-xs font-black text-cyan-300 bg-cyan-950/80 shadow-md">
            {readyItemsCount}/4
          </div>
        </div>
      </div>

      {/* 4 Readiness Check Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. GPS Fix */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isGpsReady ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-200' : 'bg-slate-950/80 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> GPS Positioning
            </span>
            {isGpsReady ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <p className="font-mono font-bold text-xs truncate text-white">
            {isGpsReady && locationState.lat && locationState.lng
              ? `${locationState.lat.toFixed(4)}°, ${locationState.lng.toFixed(4)}°`
              : locationState.status === 'denied'
              ? 'Permission Denied'
              : 'Acquiring GPS fix...'}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {locationState.accuracy ? `Accuracy: ±${locationState.accuracy}m` : 'Landmark mode'}
            </span>
            <button
              type="button"
              onClick={onRefreshLocation}
              className="font-bold text-cyan-400 hover:text-cyan-300 underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* 2. Guardian Emergency Contact */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isGuardianLinked ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-200' : 'bg-slate-950/80 border-rose-500/30 text-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-cyan-400" /> Guardian Linked
            </span>
            {isGuardianLinked ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <p className="font-bold text-xs truncate text-white">
            {isGuardianLinked ? user?.emergencyContact?.name : 'No Guardian Set'}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 truncate">
              {isGuardianLinked ? user?.emergencyContact?.phone : 'Add in Profile'}
            </span>
            <button
              type="button"
              onClick={onEditProfile}
              className="font-bold text-cyan-400 hover:text-cyan-300 underline shrink-0"
            >
              {isGuardianLinked ? 'Edit' : 'Add'}
            </button>
          </div>
        </div>

        {/* 3. Offline / Connectivity & Sync Buffer */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isOnline ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-200' : 'bg-slate-950/80 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-400">
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-cyan-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />} Network Sync
            </span>
            {isOnline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </div>
          <p className="font-bold text-xs text-white">
            {isOnline ? 'Online Sync Active' : 'Offline Buffer Mode'}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              {offlinePendingCount > 0 ? `${offlinePendingCount} queued` : 'All signals synced'}
            </span>
            {offlinePendingCount > 0 && isOnline && (
              <button
                type="button"
                onClick={onSyncOffline}
                className="font-bold text-cyan-400 hover:underline"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>

        {/* 4. Safety Zone Advisory */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          isZoneSafe ? 'bg-slate-950/80 border-emerald-500/30 text-emerald-200' : 'bg-slate-950/80 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 text-slate-400">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Active Zone
            </span>
            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
              isZoneSafe ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}>
              {currentZone.type}
            </span>
          </div>
          <p className="font-bold text-xs truncate text-white" title={currentZone.name}>
            {currentZone.name}
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 truncate" title={currentZone.policeStation}>
              {currentZone.policeStation}
            </span>
            <a href="tel:1363" className="font-bold text-cyan-400 hover:underline shrink-0">
              Dial 1363
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
