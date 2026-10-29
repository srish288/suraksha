import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LocationService } from '../../services/locationService';
import { IncidentService } from '../../services/incidentService';
import { useToast } from '../../context/ToastContext';
import { sound } from '../../services/soundService';
import type { LocationState, UiIncident } from '../../types';
import {
  AlertOctagon,
  MapPin,
  HeartPulse,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  HandMetal
} from 'lucide-react';

export interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (incident: UiIncident) => void;
}

const EMERGENCY_TYPES = [
  { id: 'general', label: 'General Threat / Danger', icon: ShieldAlert },
  { id: 'medical', label: 'Severe Medical Injury', icon: HeartPulse },
  { id: 'theft', label: 'Theft / Robbery in Progress', icon: AlertOctagon },
  { id: 'lost', label: 'Stranded in Remote Area', icon: HelpCircle }
];

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError } = useToast();
  const [selectedType, setSelectedType] = useState('general');
  const [additionalNote, setAdditionalNote] = useState('');
  const [landmarkText, setLandmarkText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [activationMode, setActivationMode] = useState<'countdown' | 'hold'>('countdown');
  const [locationState, setLocationState] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    timestamp: null,
    status: 'idle'
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<UiIncident | null>(null);

  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request location when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubmittedIncident(null);
      setCountdown(null);
      setHoldProgress(0);
      setLocationState((prev) => ({ ...prev, status: 'requesting' }));

      LocationService.getLiveLocation().then((loc) => {
        setLocationState(loc);
        if (loc.lat && loc.lng) {
          setLandmarkText(`GPS Fix: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)} (±${loc.accuracy}m)`);
        } else {
          setLandmarkText('Location permission not granted (please specify landmark)');
        }
      });
    }
  }, [isOpen]);

  // Countdown timer effect with audio and haptic feedback
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown !== null && countdown > 0) {
      sound.playCountdownTick();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleTriggerSos();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setCountdown(null);
  };

  // Hold-to-activate interaction (1.5 seconds)
  const startHold = () => {
    if (isSubmitting || submittedIncident) return;
    setHoldProgress(0);
    const stepMs = 30;
    const totalMs = 1500;
    const increment = (stepMs / totalMs) * 100;

    holdIntervalRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(holdIntervalRef.current!);
          holdIntervalRef.current = null;
          handleTriggerSos();
          return 100;
        }
        return next;
      });
    }, stepMs);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const handleTriggerSos = async () => {
    setIsSubmitting(true);
    setCountdown(null);
    setHoldProgress(100);

    try {
      const coords =
        locationState.lat && locationState.lng
          ? { lat: locationState.lat, lng: locationState.lng }
          : LocationService.getPresetCoordinates('delhi');

      const fullDesc = `[SOS - ${selectedType.toUpperCase()}] ${
        additionalNote || 'Tourist triggered instant emergency SOS.'
      } | Landmark Context: ${landmarkText || 'Not specified'}`;

      const result = await IncidentService.triggerSos(
        coords,
        fullDesc,
        landmarkText || 'Current location'
      );

      sound.playEmergencyBeep();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // ignore
        }
      }

      setSubmittedIncident(result.incident);
      showSuccess(
        result.isOfflineQueued
          ? 'Emergency SOS queued in offline buffer.'
          : 'Emergency SOS alert logged in prototype system.',
        'Distress Signal Recorded'
      );
      if (onSuccess) onSuccess(result.incident);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register SOS alert';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      maxWidth="md"
      variant="dark"
      title={
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span className="font-black text-base tracking-tight uppercase">Emergency SOS Command</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      }
    >
      {submittedIncident ? (
        /* Status Screen after activation */
        <div className="space-y-4 text-center py-2 animate-in fade-in">
          <div className="relative mx-auto w-16 h-16">
            <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-radar-ring pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white tracking-tight">
              SOS Signal Registered in System
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Incident Ref: <span className="font-mono font-bold text-slate-200">{submittedIncident.id}</span> • Status: <span className="text-amber-400 font-bold uppercase">{submittedIncident.status}</span>
            </p>
            {submittedIncident.unsynced && (
              <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/60">
                Offline Mode: Buffered locally in device queue (syncs automatically when connected)
              </span>
            )}
          </div>

          {/* CRITICAL HONESTY NOTICE */}
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-left text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ACADEMIC PROTOTYPE NOTICE</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              This software is a student engineering prototype. <strong>Real government police/ambulance dispatches are NOT connected.</strong>
            </p>
            <p className="leading-relaxed font-semibold text-[11px] text-amber-100">
              For real emergencies, immediately dial <strong>112</strong> (National Helpline) or <strong>1363</strong> (Tourist Police Helpline) below.
            </p>
          </div>

          {/* Immediate Action Checklist for Tourist */}
          <div className="p-4 bg-slate-950 border border-slate-800 text-white rounded-2xl text-left space-y-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Immediate Field Checklist
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Stay in a visible, well-lit public corridor or near a verified security booth.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Conserve mobile battery and share your live location via WhatsApp in Trips.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Dial 112 below to establish voice contact with national dispatchers.</span>
              </li>
            </ul>
          </div>

          {/* Direct Telephone Dial Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href="tel:112"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-emergency-600 to-rose-600 hover:from-emergency-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition border border-rose-400/40"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 112 (Police)</span>
            </a>
            <a
              href="tel:1363"
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-lg transition border border-slate-700"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 1363 (Tourist)</span>
            </a>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Close Window
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                onClose();
                window.location.hash = '#/history';
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white border-0"
            >
              Track in History
            </Button>
          </div>
        </div>
      ) : (
        /* SOS Trigger Screen */
        <div className="space-y-4">
          {/* Top Banner */}
          <div className="bg-rose-950/40 border border-rose-500/30 p-3.5 rounded-2xl text-rose-200 text-xs leading-relaxed flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Emergency Distress Console</p>
              <p className="text-rose-200/80 mt-0.5">
                Broadcast an emergency signal. Select countdown or hold-to-confirm to ensure zero accidental triggers.
              </p>
            </div>
          </div>

          {/* Trigger Mode Selector Tabs */}
          <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setActivationMode('countdown');
                endHold();
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                activationMode === 'countdown' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>3-Second Countdown</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActivationMode('hold');
                cancelCountdown();
              }}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                activationMode === 'hold' ? 'bg-slate-800 text-white shadow-sm border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HandMetal className="w-3.5 h-3.5" />
              <span>Hold to Confirm (1.5s)</span>
            </button>
          </div>

          {/* Emergency Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Select Distress Nature
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMERGENCY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-950/50 text-white shadow-sm ring-1 ring-rose-500/50'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location Status */}
          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Real-time Coordinates:
              </span>
              <span
                className={`font-mono font-semibold capitalize px-2 py-0.5 rounded text-[10px] ${
                  locationState.status === 'granted'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}
              >
                {locationState.status === 'requesting' ? 'Acquiring GPS...' : locationState.status}
              </span>
            </div>

            {locationState.lat && locationState.lng ? (
              <p className="font-mono text-slate-400 text-[11px]">
                Lat: {locationState.lat.toFixed(5)}, Lng: {locationState.lng.toFixed(5)} (±{locationState.accuracy}m)
              </p>
            ) : (
              <p className="text-slate-500 italic text-[11px]">
                Device GPS not granted. A simulated landmark coordinate will be attached.
              </p>
            )}

            <div>
              <label htmlFor="sos-landmark" className="block text-[10px] font-medium text-slate-400 mt-2">
                Nearby Landmark / Street (Optional):
              </label>
              <input
                id="sos-landmark"
                type="text"
                placeholder="e.g., Gate 3, Connaught Place Radial"
                value={landmarkText}
                onChange={(e) => setLandmarkText(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-slate-800 text-xs bg-slate-900 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label htmlFor="sos-note" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Situation Brief (Optional)
            </label>
            <textarea
              id="sos-note"
              rows={2}
              maxLength={200}
              placeholder="e.g., Suspicious individuals following / Medical distress"
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              className="w-full mt-1.5 p-2.5 rounded-xl border border-slate-800 text-xs bg-slate-950 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Area: Mode 1 (Countdown) or Mode 2 (Hold to Trigger) */}
          {activationMode === 'hold' ? (
            <div className="space-y-3 pt-2">
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={startHold}
                  onMouseUp={endHold}
                  onMouseLeave={endHold}
                  onTouchStart={startHold}
                  onTouchEnd={endHold}
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden py-4 px-6 rounded-2xl bg-gradient-to-r from-emergency-600 via-rose-600 to-emergency-700 hover:from-emergency-500 hover:to-rose-600 text-white font-black text-sm shadow-2xl active:scale-98 transition flex items-center justify-center gap-2 select-none border border-rose-400/40"
                >
                  {/* Progress overlay */}
                  <div
                    className="absolute inset-0 bg-rose-950 transition-all pointer-events-none opacity-80"
                    style={{ width: `${holdProgress}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-2 tracking-wide uppercase">
                    <HandMetal className="w-5 h-5 animate-pulse" />
                    <span>
                      {holdProgress > 0 ? `HOLDING (${Math.round(holdProgress)}%)` : 'PRESS & HOLD 1.5s TO SEND'}
                    </span>
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Press and hold to send distress beacon. Release early to cancel.
              </p>
            </div>
          ) : countdown !== null ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-emergency-950 via-rose-950 to-slate-950 text-white rounded-3xl p-6 text-center space-y-3 shadow-2xl border border-rose-500/50">
              <span className="absolute -inset-4 rounded-full bg-rose-600/20 animate-radar-ring pointer-events-none" />
              <p className="text-xs uppercase tracking-wider text-rose-300 font-bold">
                Transmitting Distress Beacon in
              </p>
              <div className="text-6xl font-black font-mono tracking-tight text-white animate-pulse">
                {countdown}
              </div>
              <p className="text-xs text-rose-300">
                Tap Cancel immediately if triggered by accident!
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={cancelCountdown}
                  className="bg-white text-rose-950 border-white hover:bg-rose-100 font-black px-6"
                  size="sm"
                >
                  Cancel Immediately
                </Button>
                <Button
                  variant="danger"
                  onClick={handleTriggerSos}
                  loading={isSubmitting}
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-800 font-bold"
                >
                  Send Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                fullWidth
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={startCountdown}
                loading={isSubmitting}
                icon={<AlertOctagon className="w-5 h-5" />}
                fullWidth
                size="lg"
                className="animate-emergency-pulse font-black uppercase tracking-wider bg-gradient-to-r from-emergency-600 to-rose-600 hover:from-emergency-500 hover:to-rose-500 border border-rose-400/40"
              >
                Confirm &amp; Send SOS
              </Button>
            </div>
          )}

          {/* Quick Helpline link */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Direct Dial National Police &amp; Emergency (112)
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
};
