import React from 'react';
import { ZONE_TYPES } from '@suraksha/shared';
import { ZONE_COLORS, ZONE_LABELS } from './zoneStyle';

export const SafetyLegend: React.FC<{ showSampleNote: boolean }> = ({ showSampleNote }) => (
  <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 text-[11px] text-slate-300 space-y-2">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {ZONE_TYPES.map((type) => (
        <div key={type} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: ZONE_COLORS[type], opacity: 0.85 }}
          />
          <span>{ZONE_LABELS[type]}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-full border-2 border-white bg-sky-600" />
        <span>You</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-5 border-t border-dashed border-slate-300" />
        <span>Early-warning distance</span>
      </div>
    </div>
    {showSampleNote && (
      <p className="text-slate-400">
        Demo zones are fictional examples. They are not official safety information.
      </p>
    )}
  </div>
);