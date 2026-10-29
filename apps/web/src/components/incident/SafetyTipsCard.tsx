import React from 'react';
import type { IncidentType } from '../../types';
import {
  ShieldAlert,
  CreditCard,
  HeartPulse,
  Compass,
  AlertTriangle,
  Lightbulb,
  PhoneCall
} from 'lucide-react';

export interface SafetyTipsCardProps {
  category: IncidentType;
}

const CATEGORY_TIPS: Record<
  IncidentType,
  {
    title: string;
    tips: string[];
    helplineText: string;
    helplineNumber: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  theft: {
    title: 'Immediate Theft & Loss Advisory',
    tips: [
      'Immediately freeze or block your ATM and credit cards via mobile banking apps or helpline 1930.',
      'Note the exact time, street name, and any landmarks where you last had your belongings.',
      'File an online police e-FIR or inform the nearest tourist assistance booth to obtain an official incident reference for travel insurance claims.'
    ],
    helplineText: 'Cyber Fraud & Card Scam Helpline',
    helplineNumber: '1930',
    icon: CreditCard
  },
  harassment: {
    title: 'Personal Safety & Harassment Response',
    tips: [
      'Move immediately toward well-lit, populated commercial areas, metro stations, or security checkpoints.',
      'Do not engage or argue with aggressive individuals; speak loudly and firmly to draw public attention.',
      'Dial 1091 (Women Safety) or 112 directly. Officers will dispatch a PCR mobile patrol van.'
    ],
    helplineText: 'Dedicated Women in Distress Helpline',
    helplineNumber: '1091',
    icon: ShieldAlert
  },
  medical: {
    title: 'Medical Emergency Protocol',
    tips: [
      'In critical trauma or unconsciousness, dial 102 / 112 immediately before completing this online form.',
      'Do not move an injured person if spinal, neck, or severe fracture injury is suspected.',
      'If suffering from heat exhaustion, move to shade, loosen tight clothing, and hydrate with clean bottled water or ORS.'
    ],
    helplineText: 'National Ambulance & Trauma Dispatch',
    helplineNumber: '102',
    icon: HeartPulse
  },
  accident: {
    title: 'Traffic & Road Accident Safety',
    tips: [
      'Ensure you and companions are safely off the roadway onto a raised sidewalk or barrier.',
      'Take photos of vehicle registration plates and street signage if safe to do so.',
      'If anyone requires medical care, call 102 immediately.'
    ],
    helplineText: 'Police & Traffic Emergency',
    helplineNumber: '112',
    icon: AlertTriangle
  },
  lost: {
    title: 'Lost / Stranded Navigation Guidance',
    tips: [
      'Remain in a visible, designated landmark rather than roaming further into unfamiliar alleys.',
      'Share your live location coordinates directly with your registered emergency guardian via SMS or messaging.',
      'Approach uniformed CISF, Traffic Police, or official tourist info desks for directions.'
    ],
    helplineText: 'Tourist Infoline (Multi-lingual)',
    helplineNumber: '1363',
    icon: Compass
  },
  sos: {
    title: 'Urgent SOS Life Safety Guidelines',
    tips: [
      'If you are in immediate physical danger, dial 112 directly on your phone.',
      'Keep your phone battery conserved and screen active.',
      'Observe your immediate surroundings for exit routes and safety posts.'
    ],
    helplineText: 'National Emergency Service (Pan-India)',
    helplineNumber: '112',
    icon: PhoneCall
  },
  other: {
    title: 'Tourist Grievance Support',
    tips: [
      'Keep copies of ticket receipts, bills, and hotel booking confirmation vouchers.',
      'Report taxi meter tampering or overcharging to the nearest traffic police booth.',
      'Contact 1363 for assistance with unauthorized tour guides.'
    ],
    helplineText: 'Incredible India Tourist Desk',
    helplineNumber: '1363',
    icon: Lightbulb
  }
};

export const SafetyTipsCard: React.FC<SafetyTipsCardProps> = ({ category }) => {
  const data = CATEGORY_TIPS[category];
  const Icon = data.icon;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-safety-400 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wide text-safety-300">
            {data.title}
          </h4>
        </div>

        <a
          href={`tel:${data.helplineNumber}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-safety-600 hover:bg-safety-500 text-white font-bold text-[11px] transition shrink-0"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Call {data.helplineNumber}</span>
        </a>
      </div>

      <ul className="space-y-1.5 text-xs text-slate-300 pl-1">
        {data.tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-safety-400 font-bold shrink-0">•</span>
            <span className="leading-relaxed">{tip}</span>
          </li>
        ))}
      </ul>

      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <span>Recommended safety advisory</span>
        <span>Helpline: {data.helplineText} ({data.helplineNumber})</span>
      </div>
    </div>
  );
};
