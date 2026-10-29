import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sound } from '../services/soundService';
import { pwaService } from '../services/pwaService';
import { OfflineQueueService } from '../services/offlineQueue';
import { storage } from '../services/storage';
import { Button } from '../components/common/Button';
import {
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  HardDrive,
  Trash2,
  Download,
  ShieldCheck,
  Radio,
  RefreshCw,
  Sun,
  Moon,
  Info,
  ArrowRight
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isBackendConnected, isForceDemo, toggleDemoMode } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [soundEnabled, setSoundEnabled] = useState(sound.isEnabled());
  const [offlineQueueLength, setOfflineQueueLength] = useState(0);
  const [canInstallPwa, setCanInstallPwa] = useState(pwaService.canInstall());
  const [highAccuracyGps, setHighAccuracyGps] = useState(true);

  useEffect(() => {
    setOfflineQueueLength(OfflineQueueService.getQueue().length);

    const handlePwaInstallable = () => setCanInstallPwa(true);
    window.addEventListener('suraksha_pwa_installable', handlePwaInstallable);
    return () => window.removeEventListener('suraksha_pwa_installable', handlePwaInstallable);
  }, []);

  const handleToggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
    showSuccess(next ? 'Audio cues enabled' : 'Audio cues muted');
  };

  const handleInstallPwa = async () => {
    const accepted = await pwaService.promptInstall();
    if (accepted) {
      showSuccess('SURAKSHA PWA installed successfully.', 'PWA Installed');
      setCanInstallPwa(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('suraksha_offline_pending_queue');
    setOfflineQueueLength(0);
    showSuccess('Offline pending queue cleared.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Safety Preferences &amp; System Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure PWA installability, sensory alert cues, offline storage, and view mode
          </p>
        </div>
      </div>

      {/* Role / Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Radio className="w-4 h-4 text-safety-600" />
          <span>Role Switcher (Evaluation Triage)</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Switch between the Tourist-facing safety companion and the Central Authority Dispatch Terminal to test the complete dual-ended incident response lifecycle.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-4 rounded-2xl border-2 border-safety-600 bg-safety-50/60 text-left transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-safety-900 uppercase">Tourist Portal Mode</span>
              <span className="w-2 h-2 rounded-full bg-safety-600" />
            </div>
            <p className="text-[11px] text-safety-800">
              Active: Tourist dashboard, SOS beacon, incident reporting, and digital pass.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate('/authority')}
            className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-slate-900 uppercase">Authority Console</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500">
              City-wide incident triage board, status transition pipeline, and dispatch controls.
            </p>
          </button>
        </div>
      </div>

      {/* PWA App Install Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-safety-600" />
              <span>PWA Offline Installability</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Install SURAKSHA as a standalone application on your mobile home screen or desktop. Works offline with service-worker cached assets.
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleInstallPwa}
            disabled={!canInstallPwa}
          >
            {canInstallPwa ? 'Install App' : 'Installed / Ready'}
          </Button>
        </div>
      </div>

      {/* Sensory & Sound Preferences */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-safety-600" />
          <span>Sensory &amp; Audio Feedback</span>
        </h3>

        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div>
            <span className="font-semibold text-slate-800 block">Web Audio Alert Cues</span>
            <span className="text-slate-400 text-[11px]">Synthesizes countdown pips and emergency distress tones</span>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-safety-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow" />
          </button>
        </div>

        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <span className="font-semibold text-slate-800 block">High Accuracy GPS Polling</span>
            <span className="text-slate-400 text-[11px]">Enables hardware GPS chip with ±10m precision vs cellular estimate</span>
          </div>
          <button
            type="button"
            onClick={() => setHighAccuracyGps(!highAccuracyGps)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              highAccuracyGps ? 'bg-safety-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow" />
          </button>
        </div>
      </div>

      {/* Offline Storage Inspector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-safety-600" />
          <span>Offline Storage &amp; Cache Diagnostics</span>
        </h3>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>Pending Offline Queue Items:</span>
            <span className="font-bold text-slate-900">{offlineQueueLength} item(s)</span>
          </div>
          <div className="flex justify-between">
            <span>Service Worker Cache:</span>
            <span className="font-bold text-safety-700">Active (suraksha-pwa-cache-v1)</span>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-rose-500" />}
            onClick={handleClearCache}
          >
            Clear Offline Queue Buffer
          </Button>
        </div>
      </div>
    </div>
  );
};
