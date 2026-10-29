import React, { useRef, useState, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { TouristProfile } from '../../types';
import {
  ShieldCheck,
  Phone,
  User,
  Globe,
  AlertCircle,
  Printer,
  ScanLine,
  CheckCircle,
  HardDrive,
  RotateCcw,
  Sparkles,
  KeyRound,
  FileCheck2,
  HeartPulse
} from 'lucide-react';
import { Button } from '../common/Button';
import { QrVerifyModal } from './QrVerifyModal';

export interface TouristIdCardProps {
  tourist: TouristProfile;
}

export const TouristIdCard: React.FC<TouristIdCardProps> = ({ tourist }) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // 3D Tilt states
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Smooth tilt angles (-12 to +12 degrees)
    const rotateY = (x - 0.5) * 20;
    const rotateX = (y - 0.5) * -20;

    setTilt({ rotateX, rotateY });
    setGlare({ x: x * 100, y: y * 100, opacity: 0.28 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  // Structured verification QR payload matching QrVerify schema
  const qrPayload = JSON.stringify({
    system: 'SURAKSHA_TOURIST_SAFETY',
    id: tourist.id,
    name: tourist.name,
    nat: tourist.nationality || 'IND',
    contact: tourist.phone || 'N/A',
    emergencyContact: tourist.emergencyContact,
    issuedAt: tourist.createdAt,
    hash: `SUR-VERIFIED-LOCAL-${tourist.id.slice(-6).toUpperCase()}`,
    type: 'DEMO_PROTOTYPE_PASS'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 3D Perspective Card Container */}
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="perspective-1000 w-full select-none cursor-pointer"
        onClick={() => setIsFlipped((prev) => !prev)}
        title="Click to flip card between ID and Emergency Data"
      >
        <div
          className="relative transition-transform duration-500 preserve-3d w-full min-h-[380px] sm:min-h-[360px]"
          style={{
            transform: prefersReducedMotion
              ? isFlipped
                ? 'rotateY(180deg)'
                : 'none'
              : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (isFlipped ? 180 : 0)}deg)`
          }}
        >
          {/* ================= CARD FRONT SIDE ================= */}
          <div
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border border-cyan-500/30 p-6 sm:p-8 flex flex-col justify-between overflow-hidden backface-hidden ${
              isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Iridescent Hologram Security Top Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 animate-hologram" />

            {/* Dynamic Specular Reflection Glare Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle 320px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 80%)`
              }}
            />

            {/* Subtle Security Micro-Circuit Background */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 relative z-10">
              <div className="flex items-center gap-3">
                {/* 3D Gold Security Chip Simulation */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-amber-500/30 to-amber-600/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-lg relative overflow-hidden">
                  <div className="w-6 h-6 border border-amber-400/40 rounded grid grid-cols-2 grid-rows-2">
                    <span className="border-r border-b border-amber-400/40" />
                    <span className="border-b border-amber-400/40" />
                    <span className="border-r border-amber-400/40" />
                    <span />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60">
                      Tourist Identity Pass
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active Fix
                    </span>
                    <span className="text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" /> Offline Cached
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                    SURAKSHA DIGITAL PASS
                  </h2>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs">
                <span className="text-slate-400 text-[10px] block font-mono">CREDENTIAL ID</span>
                <span className="font-mono font-bold text-sm text-cyan-300">{tourist.id}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 items-center relative z-10">
              {/* Left Details */}
              <div className="md:col-span-2 space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold">
                    Registered Traveler
                  </span>
                  <p className="text-lg font-black text-white tracking-tight mt-0.5">
                    {tourist.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-400" /> Nationality
                    </span>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">
                      {tourist.nationality || 'International Visitor'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-bold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-cyan-400" /> Phone Contact
                    </span>
                    <p className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                      {tourist.phone || 'Nil'}
                    </p>
                  </div>
                </div>

                {/* Guardian Contact Highlight */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-1">
                  <span className="text-rose-400 text-[10px] uppercase tracking-wider font-bold block">
                    Designated Emergency Guardian
                  </span>
                  {tourist.emergencyContact ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-200 gap-1">
                      <span className="font-bold text-white">{tourist.emergencyContact.name}</span>
                      <span className="font-mono text-cyan-300 font-semibold">
                        {tourist.emergencyContact.phone}
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic text-xs">No guardian linked</p>
                  )}
                </div>
              </div>

              {/* Right QR Code Section */}
              <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white text-slate-950 text-center shadow-xl border border-slate-300">
                <QRCodeSVG
                  value={qrPayload}
                  size={120}
                  level="M"
                  includeMargin={false}
                  className="rounded"
                />
                <span className="mt-2 text-[9px] font-mono font-black text-slate-700 uppercase tracking-wider">
                  Verifiable QR
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1 font-mono text-slate-400">
                <KeyRound className="w-3 h-3 text-cyan-400" />
                SUR-VERIFIED-LOCAL-{tourist.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-cyan-400 font-bold flex items-center gap-1 hover:underline">
                <RotateCcw className="w-3 h-3" /> Click to Flip Card
              </span>
            </div>
          </div>

          {/* ================= CARD REVERSE SIDE ================= */}
          <div
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl border border-cyan-500/30 p-6 sm:p-8 flex flex-col justify-between overflow-hidden backface-hidden [transform:rotateY(180deg)] ${
              !isFlipped ? 'pointer-events-none' : ''
            }`}
          >
            {/* Iridescent Hologram Security Top Ribbon */}
            <div className="absolute top-0 left-0 right-0 h-2 animate-hologram" />

            {/* Card Header Reverse */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-wider">
                    Emergency Data &amp; Consular Protocol
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Reverse Side Telemetry</p>
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Flip Back
              </span>
            </div>

            {/* Card Body Reverse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-400" /> Medical &amp; Blood Group
                </span>
                <p className="font-bold text-white text-sm">O+ (Default Record)</p>
                <p className="text-[10px] text-slate-400">No registered chronic allergies</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Jurisdiction Response
                </span>
                <p className="font-bold text-white text-sm">Delhi Tourist Police Kiosk</p>
                <p className="text-[10px] text-slate-400">Emergency Desk Line: 1363</p>
              </div>

              <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400">
                  Consular &amp; Verification Disclaimer
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  This pass verifies participation in the SURAKSHA academic prototype. In the event of emergency, presentation of this card provides first responders with emergency contact numbers and registered identity telemetry.
                </p>
              </div>
            </div>

            {/* Card Footer Reverse */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
              <span>ISSUED BY SURAKSHA DISPATCH PROTOCOL</span>
              <span>VERIFICATION TERMINAL COMPATIBLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          Pass is stored in browser cache and readable even with nil network connectivity.
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ScanLine className="w-4 h-4 text-cyan-400" />}
            onClick={() => setShowVerifyModal(true)}
            className="border-slate-800 text-slate-200 hover:bg-slate-900"
          >
            Simulate Authority Scan
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-4 h-4 text-slate-400" />}
            onClick={handlePrint}
            className="border-slate-800 text-slate-200 hover:bg-slate-900"
          >
            Print / Save Pass
          </Button>
        </div>
      </div>

      {/* Scanner Simulation Modal */}
      <QrVerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        tourist={tourist}
      />
    </div>
  );
};
