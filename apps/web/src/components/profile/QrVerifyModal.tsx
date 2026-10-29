import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { TouristProfile } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  ScanLine,
  User,
  Globe,
  Phone,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export interface QrVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourist: TouristProfile;
}

export const QrVerifyModal: React.FC<QrVerifyModalProps> = ({
  isOpen,
  onClose,
  tourist
}) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      const timer = setTimeout(() => {
        setScanning(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      variant="dark"
      title={
        <div className="flex items-center gap-2 text-white">
          <ScanLine className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-bold text-base">Authority QR Verification Simulator</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          This preview simulates the screen an authorized Tourist Police officer, hotel check-in desk, or monument entry kiosk sees upon scanning this digital pass.
        </p>

        {scanning ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 animate-bounce">
              <ScanLine className="w-8 h-8" />
            </div>
            <p className="text-xs font-mono font-bold text-slate-300 tracking-wide uppercase">
              Decoding Cryptographic QR Payload...
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            {/* Verification Success Badge */}
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-900/60 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                    Cryptographic Verification Result
                  </span>
                  <h3 className="text-base font-extrabold text-white">
                    VERIFIED TOURIST IDENTITY
                  </h3>
                </div>
              </div>

              <div className="text-right text-[11px] text-emerald-200 hidden sm:block">
                <span>Security Level</span>
                <p className="font-bold text-white">Standard Pass (L1)</p>
              </div>
            </div>

            {/* Decoded Details Grid */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Registered Tourist Name
                  </span>
                  <p className="font-bold text-white text-sm mt-0.5">{tourist.name}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Tourist Pass Identifier
                  </span>
                  <p className="font-mono font-bold text-cyan-400 text-sm mt-0.5">{tourist.id}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Nationality / Travel Origin
                  </span>
                  <p className="font-medium text-slate-200 mt-0.5">{tourist.nationality || 'Unspecified'}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                    Registered Mobile Contact
                  </span>
                  <p className="font-mono font-medium text-slate-200 mt-0.5">{tourist.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Guardian Contact info */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" /> Emergency Guardian Linked
                </span>
                {tourist.emergencyContact ? (
                  <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-white">{tourist.emergencyContact.name}</span>
                    <a
                      href={`tel:${tourist.emergencyContact.phone}`}
                      className="font-mono font-bold text-cyan-400 hover:underline"
                    >
                      {tourist.emergencyContact.phone}
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No emergency guardian recorded on pass.</p>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Verification Time: {new Date().toLocaleTimeString()}</span>
                <span>Algorithm: RSA-SHA256 Mock Simulation</span>
              </div>
            </div>

            {/* Academic Notice */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              SURAKSHA Major Project Terminal • Simulates verification response for demonstration purposes.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
            className="border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            Close Terminal View
          </Button>
        </div>
      </div>
    </Modal>
  );
};
