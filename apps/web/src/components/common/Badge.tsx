import React from 'react';
import type { IncidentStatus, IncidentSeverity, ZoneType } from '../../types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'severity' | 'zone' | 'demo' | 'default';
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  zone?: ZoneType;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  severity,
  zone,
  className = ''
}) => {
  let style = 'bg-slate-100 text-slate-800 border-slate-200';

  if (variant === 'demo') {
    style = 'bg-amber-100 text-amber-900 border-amber-300 font-medium';
  } else if (status) {
    switch (status) {
      case 'reported':
        style = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case 'acknowledged':
        style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'in_progress':
        style = 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
        break;
      case 'resolved':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'false_alarm':
        style = 'bg-slate-100 text-slate-600 border-slate-300 line-through';
        break;
    }
  } else if (severity) {
    switch (severity) {
      case 'low':
        style = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'medium':
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'high':
        style = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'critical':
        style = 'bg-rose-50 text-rose-700 border-rose-300 font-semibold';
        break;
    }
  } else if (zone) {
    switch (zone) {
      case 'safe':
        style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'caution':
        style = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'restricted':
        style = 'bg-rose-50 text-rose-700 border-rose-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style} ${className}`}
    >
      {children}
    </span>
  );
};
