import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, AlertOctagon, Bot, User } from 'lucide-react';
import { SosModal } from '../sos/SosModal';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [sosModalOpen, setSosModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 px-2 py-1 shadow-2xl"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              isActive('/') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          {/* Zones */}
          <Link
            to="/zones"
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              isActive('/zones') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Zones</span>
          </Link>

          {/* SOS Center Trigger Button */}
          <button
            type="button"
            onClick={() => setSosModalOpen(true)}
            aria-label="Emergency SOS Alert"
            className="-mt-5 w-14 h-14 rounded-full bg-gradient-to-tr from-emergency-600 via-rose-600 to-emergency-700 hover:from-emergency-500 hover:to-rose-600 text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-900/60 border-4 border-slate-950 active:scale-95 transition-transform"
          >
            <AlertOctagon className="w-6 h-6 animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-wider">SOS</span>
          </button>

          {/* AI Assistant */}
          <Link
            to="/assistant"
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              isActive('/assistant') ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Safety AI</span>
          </Link>

          {/* Pass / Profile */}
          <Link
            to="/profile"
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition ${
              isActive('/profile') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Pass/QR</span>
          </Link>
        </div>
      </nav>

      <SosModal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} />
    </>
  );
};
