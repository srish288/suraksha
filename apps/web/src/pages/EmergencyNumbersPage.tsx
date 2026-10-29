import React from 'react';
import { OFFICIAL_EMERGENCY_NUMBERS } from '../services/mockData';
import {
  PhoneCall,
  ShieldAlert,
  Compass,
  HeartHandshake,
  Activity,
  Lock,
  ExternalLink,
  AlertTriangle,
  Info
} from 'lucide-react';

export const EmergencyNumbersPage: React.FC = () => {
  const getHelplineIcon = (name: string) => {
    switch (name) {
      case 'Compass':
        return <Compass className="w-6 h-6 text-emerald-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-purple-600" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-rose-600" />;
      case 'Lock':
        return <Lock className="w-6 h-6 text-sky-600" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-emergency-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Official Tourist Safety Helplines
            </h1>
            <p className="text-xs text-slate-500">
              Verified national 24x7 emergency and tourist assistance hotlines in India
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Direct Lifeline:</strong> The telephone numbers listed below are genuine, toll-free Indian government helplines. If you are experiencing a life-threatening crisis, dial them directly from your mobile device.
          </p>
        </div>
      </div>

      {/* Helplines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OFFICIAL_EMERGENCY_NUMBERS.map((item) => (
          <div
            key={item.number}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getHelplineIcon(item.iconName)}
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Toll Free 24x7
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{item.service}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Direct Dial
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                  {item.number}
                </span>
              </div>

              <a
                href={`tel:${item.number}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {item.number}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Tips Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-lg font-black tracking-tight">Essential Tourist Safety Protocols</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-white text-sm">1. Digital Backup</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Keep an offline screenshot of your SURAKSHA QR Safety Pass on your phone in case of poor cellular reception.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-white text-sm">2. Verified Transit</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Use registered prepaid taxi booths at railway stations and airports or verified ride-hailing applications.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-white text-sm">3. Guardian Sync</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ensure your emergency contact person's mobile number is up to date in your SURAKSHA profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
