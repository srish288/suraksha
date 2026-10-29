import React from 'react';
import { ShieldCheck, PhoneCall, HeartHandshake, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pb-20 md:pb-8 pt-10 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Emergency Bar */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emergency-600/20 text-emergency-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Official Tourist Safety Helplines (India)</p>
              <p className="text-slate-400 text-xs mt-0.5">
                Incredible India Tourist Police: <strong className="text-white">1363</strong> (Toll Free) • National Police &amp; Distress: <strong className="text-white">112</strong>
              </p>
            </div>
          </div>

          <Link
            to="/helplines"
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition shrink-0"
          >
            View All Helplines
          </Link>
        </div>

        {/* Middle Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-safety-400" />
              <span className="font-black text-white text-base tracking-tight">SURAKSHA</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Smart Tourist Safety Monitoring &amp; Incident Response Prototype for academic presentation and field testing.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Tourist Actions</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/" className="hover:text-white transition">Safety Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-white transition">Report an Incident</Link></li>
              <li><Link to="/history" className="hover:text-white transition">Incident History &amp; Status</Link></li>
              <li><Link to="/profile" className="hover:text-white transition">Digital Safety Pass &amp; QR</Link></li>
            </ul>
          </div>

          {/* Safety Protocols */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Safety Guidelines</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Always share live itinerary with your guardian.</li>
              <li>• Prefer pre-paid verified tourist transport booths.</li>
              <li>• Keep digital copy of ID pass accessible offline.</li>
              <li>• Dial 112 directly for critical life-safety distress.</li>
            </ul>
          </div>

          {/* Academic Prototype Notice */}
          <div className="space-y-2">
            <h4 className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Project Disclaimer
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              SURAKSHA is a college major-project demonstration system. It is <strong>NOT</strong> an active government 911/112 public safety answering point. Mock actions do not dispatch real forces.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 text-center text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} SURAKSHA — Smart Tourist Safety Monitoring System. Developed for College Major Project Evaluation.</p>
        </div>
      </div>
    </footer>
  );
};
