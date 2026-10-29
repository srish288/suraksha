import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { TouristProfile } from '../../types';
import { User, Phone, Globe, ShieldAlert } from 'lucide-react';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourist: TouristProfile;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  tourist
}) => {
  const { updateProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [phone, setPhone] = useState(tourist.phone || '');
  const [nationality, setNationality] = useState(tourist.nationality || '');
  const [emergencyName, setEmergencyName] = useState(
    tourist.emergencyContact?.name || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    tourist.emergencyContact?.phone || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (phone && phone.trim().length < 7) {
      newErrors.phone = 'Phone number must be at least 7 digits';
    }

    if (emergencyPhone && !emergencyName) {
      newErrors.emergencyName = 'Please provide contact name for emergency phone';
    }

    if (emergencyName && !emergencyPhone) {
      newErrors.emergencyPhone = 'Please provide contact phone for emergency contact';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await updateProfile({
        phone: phone.trim(),
        nationality: nationality.trim(),
        emergencyContact:
          emergencyName.trim() && emergencyPhone.trim()
            ? {
                name: emergencyName.trim(),
                phone: emergencyPhone.trim()
              }
            : undefined
      });

      showSuccess('Your tourist profile has been updated.', 'Profile Updated');
      onClose();
    } catch (err) {
      showError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Tourist Safety Profile"
      maxWidth="md"
      variant="dark"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-400">
          Update the contact and guardian information displayed on your digital safety pass.
        </p>

        {/* Read only account details */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
          <div>
            <span className="font-semibold text-slate-400">Account Name:</span> {tourist.name}
          </div>
          <div>
            <span className="font-semibold text-slate-400">Registered Email:</span> {tourist.email} (Fixed)
          </div>
        </div>

        <Input
          label="Mobile Phone Number"
          type="tel"
          icon={<Phone className="w-4 h-4" />}
          placeholder="+91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          helperText="Used by tourist safety authorities during emergencies"
        />

        <Input
          label="Nationality / Home Country"
          type="text"
          icon={<Globe className="w-4 h-4" />}
          placeholder="e.g., India, United States, Germany"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          error={errors.nationality}
        />

        {/* Emergency Contact section */}
        <div className="pt-2 border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">
            <ShieldAlert className="w-4 h-4 text-emergency-600" />
            <span>Emergency Guardian / Contact Person</span>
          </div>

          <div className="space-y-3">
            <Input
              label="Contact Full Name"
              type="text"
              icon={<User className="w-4 h-4" />}
              placeholder="e.g., Sunita Sharma (Mother / Partner)"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              error={errors.emergencyName}
            />

            <Input
              label="Emergency Contact Phone"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
              placeholder="+91 98765 01234"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              error={errors.emergencyPhone}
              helperText="Will be displayed on your digital tourist badge"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
