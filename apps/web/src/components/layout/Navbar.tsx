import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SosButton } from '../sos/SosButton';
import { OfflineQueueService } from '../../services/offlineQueue';
import { sound } from '../../services/soundService';
import {
  ShieldCheck,
  Menu,
  X,
  User,
  LogOut,
  FileText,
  Clock,
  QrCode,
  PhoneCall,
  Sparkles,
  Home,
  CloudOff,
  Volume2,
  VolumeX,
  Compass,
  MapPin,
  Bot,
  Settings,
  Radio
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isBackendConnected, isForceDemo, toggleDemoMode } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [offlinePendingCount, setOfflinePendingCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled());

  useEffect(() => {
    const handleQueueChange = () => {
      setOfflinePendingCount(OfflineQueueService.getQueue().length);
    };

    window.addEventListener('suraksha_offline_queue_changed', handleQueueChange);
    handleQueueChange();

    return () => {
      window.removeEventListener('suraksha_offline_queue_changed', handleQueueChange);
    };
  }, []);

  const navLinks = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/zones', label: 'Safety Zones', icon: Compass },
    { to: '/report', label: 'Report Incident', icon: FileText },
    { to: '/history', label: 'Incidents', icon: Clock },
    { to: '/trips', label: 'Trips & Places', icon: MapPin },
    { to: '/assistant', label: 'Safety AI', icon: Bot },
    { to: '/profile', label: 'Digital Pass', icon: QrCode }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  };

  const toggleSound = () => {
    const next = sound.toggleSound();
    setSoundEnabled(next);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg p-1 shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  SURAKSHA
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Command PWA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden lg:block -mt-0.5">
                Smart Tourist Safety &amp; Incident Monitoring
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto" aria-label="Main navigation">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio Cue Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition hidden sm:inline-flex"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Offline sync badge if pending */}
            {offlinePendingCount > 0 && (
              <Link
                to="/history"
                title={`${offlinePendingCount} incident(s) waiting in offline buffer`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse"
              >
                <CloudOff className="w-3.5 h-3.5" />
                <span>{offlinePendingCount} Offline</span>
              </Link>
            )}

            {/* Backend / Demo mode status indicator */}
            <button
              type="button"
              onClick={toggleDemoMode}
              title="Click to toggle between Live Backend and Prototype Demo Mode"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                !isForceDemo && isBackendConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
              }`}
            >
              {!isForceDemo && isBackendConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>API Live</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Demo Mode</span>
                </>
              )}
            </button>

            {/* Quick SOS in Navbar */}
            {isAuthenticated && (
              <SosButton variant="navbar" />
            )}

            {/* Auth Dropdown or Login buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-900 text-slate-300 transition"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-slate-950 font-black text-xs flex items-center justify-center shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-200 hidden xl:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Profile menu dropdown */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 text-slate-200"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <p className="text-[10px] font-mono text-cyan-400 mt-0.5">ID: {user.id}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Tourist Profile &amp; Pass</span>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings &amp; PWA</span>
                    </Link>

                    <Link
                      to="/authority"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950 transition"
                    >
                      <Radio className="w-4 h-4 text-cyan-400" />
                      <span>Authority Terminal</span>
                    </Link>

                    <Link
                      to="/helplines"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <PhoneCall className="w-4 h-4 text-slate-400" />
                      <span>Official Helplines</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/50 transition border-t border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl shadow-md transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <Link
              to="/authority"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded-xl border border-cyan-800/60 flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Authority Console</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
