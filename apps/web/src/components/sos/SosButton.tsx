import React, { useState } from 'react';
import { AlertOctagon, Radio, ShieldAlert } from 'lucide-react';
import { SosModal } from './SosModal';

export interface SosButtonProps {
  variant?: 'floating' | 'navbar' | 'hero' | 'compact';
  className?: string;
}

export const SosButton: React.FC<SosButtonProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <>
        <div className="fixed bottom-20 sm:bottom-8 right-5 z-40">
          {/* Spatial Concentric Pulse Rings */}
          <span className="absolute -inset-2 rounded-full bg-emergency-600/30 animate-radar-ring pointer-events-none" />
          <span className="absolute -inset-4 rounded-full bg-emergency-600/15 animate-radar-ring pointer-events-none delay-700" />

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            aria-label="Emergency SOS - Trigger safety alert"
            className={`relative flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-gradient-to-r from-emergency-600 via-rose-600 to-emergency-700 hover:from-emergency-500 hover:to-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-2xl hover:shadow-emergency-600/60 transition-all active:scale-95 animate-emergency-pulse border border-rose-300/40 backdrop-blur-md ${className}`}
          >
            <AlertOctagon className="w-5 h-5 animate-pulse" />
            <span>SOS DISTRESS</span>
          </button>
        </div>

        <SosModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'hero') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Emergency SOS - Instant Distress Trigger"
          className={`w-full group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emergency-950 via-emergency-900 to-slate-950 p-6 sm:p-7 text-white shadow-2xl hover:shadow-rose-900/40 transition-all duration-300 transform active:scale-[0.99] border border-rose-500/40 hover:border-rose-400 text-left ${className}`}
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              {/* Pulsing Beacon Target */}
              <div className="relative shrink-0">
                <span className="absolute -inset-2 rounded-2xl bg-rose-500/25 animate-radar-ring" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emergency-600 to-rose-700 flex items-center justify-center text-white shadow-lg border border-rose-400/50 group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-8 h-8 animate-pulse text-white" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    <Radio className="w-3 h-3 animate-pulse" /> Urgent Safety Beacon
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Accident-Safe Trigger
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-rose-100 transition">
                  EMERGENCY SOS
                </h3>
                <p className="text-xs text-rose-200/80 max-w-lg leading-relaxed">
                  Activate instant distress broadcast with live GPS telemetry. Dual mode with 3s abort timer and 1-tap direct emergency phone links.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <span className="px-5 py-2.5 rounded-2xl bg-white text-emergency-800 font-black text-xs uppercase tracking-wider shadow-lg group-hover:bg-rose-50 transition border border-white">
                Launch SOS
              </span>
            </div>
          </div>
        </button>

        <SosModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  if (variant === 'navbar') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label="Emergency SOS Alert"
          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-black text-xs tracking-wider uppercase shadow-sm hover:shadow transition active:scale-95 border border-rose-400/30 ${className}`}
        >
          <AlertOctagon className="w-4 h-4 animate-pulse" />
          <span>SOS</span>
        </button>

        <SosModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-sm shadow transition active:scale-95 border border-rose-400/30 ${className}`}
      >
        <AlertOctagon className="w-4 h-4" />
        <span>Emergency SOS</span>
      </button>

      <SosModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
