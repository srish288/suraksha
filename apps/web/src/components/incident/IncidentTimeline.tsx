import React from 'react';
import type { IncidentStatus } from '../../types';
import { Check, Clock, AlertCircle, Ban } from 'lucide-react';

export interface IncidentTimelineProps {
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

const STEPS: Array<{ id: IncidentStatus; label: string; desc: string }> = [
  { id: 'reported', label: 'Signal Logged', desc: 'Dispatched from tourist device' },
  { id: 'acknowledged', label: 'Desk Triage', desc: 'Central monitoring review' },
  { id: 'in_progress', label: 'Security Unit Action', desc: 'Assigned to field responders' },
  { id: 'resolved', label: 'Resolved / Closed', desc: 'Incident conclusion recorded' }
];

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  status,
  createdAt,
  updatedAt
}) => {
  if (status === 'false_alarm') {
    return (
      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Ban className="w-4 h-4 text-slate-500 shrink-0" />
        <span>This report was withdrawn and marked as a <strong>False Alarm</strong>. No active dispatch pending.</span>
      </div>
    );
  }

  const getStepIndex = (s: IncidentStatus) => {
    switch (s) {
      case 'reported':
        return 0;
      case 'acknowledged':
        return 1;
      case 'in_progress':
        return 2;
      case 'resolved':
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="py-2 space-y-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
        Response Lifecycle Stepper
      </span>

      <div className="grid grid-cols-4 gap-1 relative">
        {/* Connector Line behind steps */}
        <div className="absolute top-4 left-[12%] right-[12%] h-0.5 bg-slate-200 -z-0" />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10 px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isCompleted
                    ? 'bg-safety-600 text-white shadow-sm ring-2 ring-safety-200'
                    : isCurrent
                    ? 'bg-amber-500 text-white shadow-sm ring-4 ring-amber-100 animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="mt-2 space-y-0.5">
                <p
                  className={`text-[11px] font-bold leading-tight ${
                    isCurrent ? 'text-amber-900' : isCompleted ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[9px] text-slate-500 leading-tight hidden sm:block">
                  {step.desc}
                </p>
                {isCurrent && (
                  <span className="inline-block mt-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1 py-0.2 rounded">
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <span>Logged: {new Date(createdAt).toLocaleTimeString()}</span>
        <span>Latest Update: {new Date(updatedAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
