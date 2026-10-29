import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LocationService } from '../services/locationService';
import { IncidentService } from '../services/incidentService';
import { OfflineQueueService } from '../services/offlineQueue';
import { SAMPLE_ZONES, DEFAULT_DEMO_TOURIST } from '../services/mockData';
import { SosButton } from '../components/sos/SosButton';
import { IncidentCard } from '../components/incident/IncidentCard';
import { SafetyReadinessWidget } from '../components/dashboard/SafetyReadinessWidget';
import { SpatialSafetyGlobe } from '../components/3d/SpatialSafetyGlobe';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Button } from '../components/common/Button';
import type { LocationState, UiIncident, SafetyZoneInfo } from '../types';
import {
  ShieldCheck,
  FileText,
  Clock,
  QrCode,
  PhoneCall,
  ChevronRight,
  Info,
  CloudOff,
  RefreshCw,
  Sparkles,
  Compass,
  MapPin,
  Bot
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isBackendConnected, isForceDemo } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [locationState, setLocationState] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    timestamp: null,
    status: 'idle'
  });
  const [currentZone, setCurrentZone] = useState<SafetyZoneInfo>(SAMPLE_ZONES[0]);
  const [recentIncidents, setRecentIncidents] = useState<UiIncident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  const fetchLocation = async () => {
    setLocationState((prev) => ({ ...prev, status: 'requesting' }));
    const loc = await LocationService.getLiveLocation();
    setLocationState(loc);
  };

  const loadIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const result = await IncidentService.getMyIncidents();
      setRecentIncidents(result.items.slice(0, 3));
      setOfflineCount(result.pendingOfflineCount);
    } catch {
      setRecentIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const handleSyncOffline = async () => {
    try {
      const res = await OfflineQueueService.syncPendingReports();
      if (res.syncedCount > 0) {
        showSuccess(`Successfully synchronized ${res.syncedCount} offline incident report(s) with backend.`, 'Sync Completed');
        loadIncidents();
      } else if (res.failedCount > 0) {
        showError('Backend server is currently unreachable. Reports remain safe in offline queue.');
      } else {
        showInfo('All reports are currently up to date.', 'In Sync');
      }
    } catch {
      showError('Failed to sync offline queue.');
    }
  };

  useEffect(() => {
    fetchLocation();
    loadIncidents();
  }, []);

  const tourist = user || DEFAULT_DEMO_TOURIST;

  return (
    <div className="space-y-6 pb-12">
      {/* Offline Pending Alert Banner if any reports are waiting in local buffer */}
      {offlineCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500 text-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CloudOff className="w-5 h-5 shrink-0" />
            <p className="text-xs font-semibold">
              <strong>Offline Buffer Active:</strong> You have {offlineCount} incident report(s) saved locally on your device.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncOffline}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-900 transition shrink-0"
          >
            Sync with Server
          </button>
        </div>
      )}

      {/* Prototype Demo Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-md">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <p>
            <strong className="text-amber-300">College Major-Project Demonstration Mode:</strong>{' '}
            {!isForceDemo && isBackendConnected
              ? 'Backend API connected on http://localhost:5000. Realtime database sync active.'
              : 'Standalone prototype mode active. Real emergency responders are not dispatched.'}
          </p>
        </div>
        <Link
          to="/helplines"
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline shrink-0 flex items-center gap-1"
        >
          View 24/7 Helplines (112 / 1363)
        </Link>
      </div>

      {/* Welcome & Tourist Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                Tourist Safety Portal
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Ref: {tourist.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Namaste, {tourist.name}
            </h1>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              SURAKSHA is monitoring your registered tourist safety parameters. In any emergency, activate the instant SOS beacon below.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-400">Origin / Nationality:</span>{' '}
                <strong className="text-white">{tourist.nationality || 'International Visitor'}</strong>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                <span className="text-slate-400">Emergency Guardian:</span>{' '}
                <strong className="text-white">
                  {tourist.emergencyContact?.name
                    ? `${tourist.emergencyContact.name} (${tourist.emergencyContact.phone})`
                    : 'Not configured'}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick pass shortcut */}
          <div className="shrink-0 flex sm:flex-col gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold backdrop-blur-md border border-cyan-500/30 transition shadow-lg"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Digital Pass &amp; QR</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Hero SOS Button */}
      <SosButton variant="hero" />

      {/* Senior Product Innovation: Comprehensive Safety Readiness & Situational Awareness Bar */}
      <SafetyReadinessWidget
        user={tourist}
        locationState={locationState}
        currentZone={currentZone}
        onRefreshLocation={fetchLocation}
        onEditProfile={() => setIsEditProfileOpen(true)}
        onSyncOffline={handleSyncOffline}
      />

      {/* Signature 3D Experience: Spatial Safety Command Center */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Spatial Safety Command Center</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 3D geofence globe &amp; real-time field perimeter telemetry
            </p>
          </div>
          <Link
            to="/zones"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
          >
            <span>Full Radar Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <SpatialSafetyGlobe
          userLocation={locationState}
          incidents={recentIncidents}
          onSelectZone={(z) => setCurrentZone(z)}
        />
      </div>

      {/* Quick Action Tiles */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Quick Tourist Services &amp; Tools
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/report"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-cyan-950/40 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 transition text-cyan-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-cyan-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                Report Incident
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Theft, medical, lost</p>
            </div>
          </Link>

          <Link
            to="/zones"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-emerald-950/40 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500 transition text-emerald-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-emerald-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-emerald-300 transition">
                Safety Zones
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Geofence radar map</p>
            </div>
          </Link>

          <Link
            to="/trips"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-sky-950/40 hover:border-sky-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 group-hover:bg-sky-500 transition text-sky-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-sky-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-sky-300 transition">
                Trips &amp; Places
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Hotel, base &amp; share</p>
            </div>
          </Link>

          <Link
            to="/assistant"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-purple-950/40 hover:border-purple-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 group-hover:bg-purple-500 transition text-purple-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-purple-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-purple-300 transition">
                Safety AI
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Scam &amp; travel advisor</p>
            </div>
          </Link>

          <Link
            to="/history"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-amber-950/40 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 transition text-amber-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                Incident History
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Resolution pipeline</p>
            </div>
          </Link>

          <Link
            to="/profile"
            className="group p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md hover:shadow-cyan-950/40 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 transition text-cyan-400 group-hover:text-slate-950 flex items-center justify-center mb-2.5 border border-cyan-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                Digital Pass
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Verifiable QR ID</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Incidents Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg text-white">Your Recent Activity</h3>
            <p className="text-xs text-slate-400">Live safety events registered on your account</p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            <span>View All ({recentIncidents.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingIncidents ? (
          <div className="p-8 text-center bg-slate-900/90 rounded-2xl border border-slate-800 text-xs text-slate-400">
            Loading recent reports...
          </div>
        ) : recentIncidents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/90 rounded-3xl border border-slate-800 space-y-2">
            <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto" />
            <h4 className="font-bold text-sm text-white">No Incidents Reported</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't filed any safety reports. If you encounter any difficulty or distress, use the Report button.
            </p>
            <div className="pt-2">
              <Link to="/report">
                <Button variant="outline" size="sm" className="border-slate-800 text-slate-200 hover:bg-slate-800">
                  Report an Incident
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentIncidents.map((inc) => (
              <IncidentCard key={inc.id} incident={inc} onStatusChange={loadIncidents} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal from Quick Access */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        tourist={tourist}
      />
    </div>
  );
};
