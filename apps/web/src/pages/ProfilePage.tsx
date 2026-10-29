import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TouristIdCard } from '../components/profile/TouristIdCard';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Button } from '../components/common/Button';
import { DEFAULT_DEMO_TOURIST } from '../services/mockData';
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  Globe,
  Edit,
  ShieldAlert,
  AlertTriangle,
  QrCode
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // If user is not yet loaded, fallback to default demo profile
  const tourist = user || DEFAULT_DEMO_TOURIST;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tourist Profile &amp; Digital Safety Pass
            </h1>
            <p className="text-xs text-slate-500">
              Manage your emergency contact details and display your official SURAKSHA QR Identity
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Edit className="w-4 h-4" />}
          onClick={() => setIsEditModalOpen(true)}
        >
          Edit Profile
        </Button>
      </div>

      {/* Main Digital Pass Section */}
      <section aria-label="Digital Tourist Safety Pass">
        <TouristIdCard tourist={tourist} />
      </section>

      {/* Profile Details Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-bold text-base text-slate-900">
            Tourist Safety Metadata
          </h2>
          <span className="text-xs font-mono text-slate-400">
            System Ref: {tourist.id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          {/* Legal Name */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </span>
            <p className="font-bold text-sm text-slate-900">{tourist.name}</p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Registered Email
            </span>
            <p className="font-bold text-sm text-slate-900">{tourist.email}</p>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Contact Phone
            </span>
            <p className="font-bold text-sm text-slate-900">
              {tourist.phone || <span className="text-slate-400 italic">Not set</span>}
            </p>
          </div>

          {/* Nationality */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Nationality
            </span>
            <p className="font-bold text-sm text-slate-900">
              {tourist.nationality || 'Unspecified'}
            </p>
          </div>

          {/* System Role */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Role
            </span>
            <p className="font-bold text-sm text-safety-700 capitalize">
              {tourist.role}
            </p>
          </div>

          {/* Issue Date */}
          <div className="space-y-1">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Pass Issued On
            </span>
            <p className="font-bold text-sm text-slate-900">
              {new Date(tourist.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Emergency Guardian Card */}
        <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-950 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Designated Emergency Guardian Contact</span>
          </div>

          {tourist.emergencyContact ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-rose-700 text-[11px]">Guardian Name:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {tourist.emergencyContact.name}
                </p>
              </div>
              <div>
                <span className="text-rose-700 text-[11px]">Guardian Telephone:</span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  <a
                    href={`tel:${tourist.emergencyContact.phone}`}
                    className="hover:underline text-rose-800"
                  >
                    {tourist.emergencyContact.phone}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-xs text-rose-800">
              <p>No guardian contact added yet. Adding one helps authorities contact your family in an emergency.</p>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-rose-800 border-rose-300 hover:bg-rose-100"
                onClick={() => setIsEditModalOpen(true)}
              >
                Add Guardian
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tourist={tourist}
      />
    </div>
  );
};
