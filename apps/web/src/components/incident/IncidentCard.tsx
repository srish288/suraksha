import React, { useState } from 'react';
import type { UiIncident } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmModal } from '../common/ConfirmModal';
import { IncidentTimeline } from './IncidentTimeline';
import { IncidentService } from '../../services/incidentService';
import { useToast } from '../../context/ToastContext';
import {
  AlertTriangle,
  AlertOctagon,
  HeartPulse,
  ShoppingBag,
  HelpCircle,
  Car,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CloudOff,
  Image as ImageIcon
} from 'lucide-react';

export interface IncidentCardProps {
  incident: UiIncident;
  onStatusChange?: () => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onStatusChange }) => {
  const { showSuccess, showError } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'sos':
        return <AlertOctagon className="w-5 h-5 text-emergency-600" />;
      case 'medical':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'theft':
        return <ShoppingBag className="w-5 h-5 text-amber-500" />;
      case 'harassment':
        return <ShieldAlert className="w-5 h-5 text-purple-500" />;
      case 'accident':
        return <Car className="w-5 h-5 text-orange-500" />;
      case 'lost':
        return <HelpCircle className="w-5 h-5 text-sky-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleCancelFalseAlarm = async () => {
    setIsCancelling(true);
    try {
      await IncidentService.markFalseAlarm(incident.id, 'User clicked Cancel False Alarm');
      showSuccess('Incident marked as false alarm.', 'Report Updated');
      setShowCancelModal(false);
      if (onStatusChange) onStatusChange();
    } catch {
      showError('Failed to cancel incident.');
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancel = incident.status === 'reported' || incident.status === 'acknowledged';

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition-all overflow-hidden text-slate-100">
      <div className="p-5">
        {/* Top header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
              {getCategoryIcon(incident.type)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-white uppercase tracking-wide">
                  {incident.type} Incident
                </span>
                {incident.unsynced && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                    <CloudOff className="w-3 h-3" /> Unsynced Offline
                  </span>
                )}
                {incident.isDemo && !incident.unsynced && (
                  <Badge variant="demo">Demo Record</Badge>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Ref: {incident.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <Badge status={incident.status}>{incident.status.replace('_', ' ')}</Badge>
            {incident.severity && (
              <Badge severity={incident.severity}>{incident.severity}</Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3.5 text-xs text-slate-300 leading-relaxed font-normal">
          {incident.description}
        </p>

        {/* Location & Time info row */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate max-w-[220px]">
              {incident.landmark || `${incident.location.lat.toFixed(4)}, ${incident.location.lng.toFixed(4)}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {incident.photoUrl && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Evidence attached
              </span>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{new Date(incident.createdAt).toLocaleString(undefined, {
                dateStyle: 'short',
                timeStyle: 'short'
              })}</span>
            </div>
          </div>
        </div>

        {/* Optional Expandable Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs animate-in fade-in">
            {/* Real Lifecycle Timeline Stepper */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
              <IncidentTimeline
                status={incident.status}
                createdAt={incident.createdAt}
                updatedAt={incident.updatedAt}
              />
            </div>

            {/* GPS & Landmark details */}
            <div className="p-3 bg-slate-950 rounded-xl space-y-1 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block text-[11px] uppercase">
                Location Coordinates &amp; Context
              </span>
              <p className="font-mono text-cyan-300">
                Lat: {incident.location.lat.toFixed(6)} | Lng: {incident.location.lng.toFixed(6)}
              </p>
              {incident.landmark && (
                <p className="text-slate-300">
                  <span className="font-medium text-slate-400">Landmark / Location Note:</span> {incident.landmark}
                </p>
              )}
            </div>

            {/* Photo preview if attached */}
            {incident.photoUrl && (
              <div className="p-3 bg-slate-950 rounded-xl space-y-2 border border-slate-800/80">
                <span className="font-semibold text-slate-300 block text-[11px] uppercase">
                  Attached Photo Evidence
                </span>
                <div className="max-w-xs rounded-xl overflow-hidden border border-slate-800">
                  <img
                    src={incident.photoUrl}
                    alt="Evidence preview"
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-1.5 bg-slate-900 text-white text-[9px] text-center font-mono">
                    Local Evidence Buffer
                  </div>
                </div>
              </div>
            )}

            {/* Risk engine score if present */}
            {incident.risk && (
              <div className="p-3 bg-slate-950 rounded-xl space-y-1.5 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 text-[11px] uppercase">
                    Risk Engine Assessment
                  </span>
                  <span className="font-bold text-[11px] text-cyan-300 font-mono">
                    Score: {incident.risk.score}/100 ({incident.risk.level.toUpperCase()})
                  </span>
                </div>
                {incident.risk.factors.map((f, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-slate-500">•</span>
                    <span><strong className="text-slate-200">{f.label}:</strong> {f.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Activity Log / Notes */}
            {incident.notes && incident.notes.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-slate-300 text-[11px] uppercase block">
                  Activity Trail &amp; Audit Notes
                </span>
                <ul className="space-y-1 text-[11px] text-slate-400">
                  {incident.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">✓</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* False alarm action */}
            {canCancel && (
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-emergency-700 border-emergency-200 hover:bg-emergency-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  Mark False Alarm / Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Toggle Expansion */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>{expanded ? 'Show Less' : 'View Full Details & Timeline'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Confirm False Alarm Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelFalseAlarm}
        loading={isCancelling}
        title="Mark as False Alarm?"
        message="Are you sure you want to cancel this report? This will mark the incident as a false alarm in the system."
        confirmLabel="Yes, Mark False Alarm"
        cancelLabel="Keep Active"
      />
    </div>
  );
};
