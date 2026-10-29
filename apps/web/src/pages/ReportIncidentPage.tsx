import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IncidentService } from '../services/incidentService';
import { LocationService } from '../services/locationService';
import { sound } from '../services/soundService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { SafetyTipsCard } from '../components/incident/SafetyTipsCard';
import {
  INCIDENT_TYPES,
  type IncidentType,
  createIncidentSchema
} from '@suraksha/shared';
import type { LocationState, LatLng } from '../types';
import {
  FileText,
  MapPin,
  Camera,
  AlertTriangle,
  HeartPulse,
  ShoppingBag,
  Car,
  HelpCircle,
  ShieldAlert,
  AlertOctagon,
  Sparkles,
  Info,
  CheckCircle,
  UploadCloud,
  X
} from 'lucide-react';

const CATEGORY_DETAILS: Record<
  IncidentType,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  theft: {
    label: 'Theft / Stolen Item',
    description: 'Bag snatching, pickpocketing, stolen travel luggage, or hotel theft',
    icon: ShoppingBag
  },
  harassment: {
    label: 'Harassment / Stalking',
    description: 'Unwanted following, verbal/physical abuse, or aggressive solicitation',
    icon: ShieldAlert
  },
  medical: {
    label: 'Medical Emergency',
    description: 'Heat stroke, food poisoning, severe injury, or trauma requiring doctor',
    icon: HeartPulse
  },
  accident: {
    label: 'Road / Transit Accident',
    description: 'Vehicle collision, auto-rickshaw overturn, or pedestrian accident',
    icon: Car
  },
  lost: {
    label: 'Lost & Found / Stranded',
    description: 'Lost passport, lost in unfamiliar area, or separated travel companion',
    icon: HelpCircle
  },
  sos: {
    label: 'Emergency SOS / Distress',
    description: 'Immediate threat or life danger requiring urgent monitoring',
    icon: AlertOctagon
  },
  other: {
    label: 'Other Tourist Grievance',
    description: 'Taxi fare scam, unauthorized guide, or public disturbance',
    icon: AlertTriangle
  }
};

export const ReportIncidentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  const [category, setCategory] = useState<IncidentType>('theft');
  const [description, setDescription] = useState('');
  const [landmark, setLandmark] = useState('');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [locationState, setLocationState] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    timestamp: null,
    status: 'idle'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    LocationService.getLiveLocation().then((loc) => {
      setLocationState(loc);
      if (loc.lat && loc.lng) {
        setCustomLat(loc.lat.toString());
        setCustomLng(loc.lng.toString());
      } else {
        const preset = LocationService.getPresetCoordinates('delhi');
        setCustomLat(preset.lat.toString());
        setCustomLng(preset.lng.toString());
      }
    });
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Image must be under 5MB for prototype preview.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Please provide a description of the incident.';
    } else if (description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters.';
    }

    const latNum = parseFloat(customLat);
    const lngNum = parseFloat(customLng);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.location = 'Please provide a valid latitude (-90 to 90).';
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      newErrors.location = 'Please provide a valid longitude (-180 to 180).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const lat = parseFloat(customLat);
      const lng = parseFloat(customLng);

      const result = await IncidentService.reportIncident({
        type: category,
        description: description.trim(),
        location: { lat, lng },
        landmark: landmark.trim() || undefined,
        photoUrl: photoPreview || undefined
      });

      sound.playSuccessChime();

      showSuccess(
        result.message || 'Report submitted to SURAKSHA tracking.',
        result.isOfflineQueued
          ? 'Queued in Offline Buffer'
          : result.isMock
          ? 'Demo Report Filed'
          : 'Server Updated'
      );

      navigate('/history');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit incident report.';
      showError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillSampleReport = () => {
    setCategory('theft');
    setDescription(
      'Lost backpack containing camera and international travel card while sitting at the outdoor café near the heritage plaza.'
    );
    setLandmark('Outdoor Heritage Café, Northern Plaza, Sector 4');
    setCustomLat('28.6139');
    setCustomLng('77.2090');
    setErrors({});
    showInfo('Filled sample report fields for testing.', 'Sample Injected');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-safety-50 border border-safety-100 flex items-center justify-center text-safety-600 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Report Safety Incident
              </h1>
              <p className="text-xs text-slate-500">
                Log a tourist grievance, security distress, or emergency report
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFillSampleReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Fill Sample Report</span>
          </button>
        </div>

        {/* Prototype Honesty Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Demonstration Prototype Notice:</strong> Submitting this report registers an entry in the SURAKSHA evaluation database. When backend is offline, local storage offline queue is used. <strong>No real police dispatch occurs.</strong>
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Category Picker */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            1. Select Incident Category <span className="text-emergency-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INCIDENT_TYPES.map((type) => {
              const detail = CATEGORY_DETAILS[type];
              const Icon = detail.icon;
              const isSelected = category === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCategory(type)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-safety-600 bg-safety-50/70 text-slate-900 shadow-sm ring-1 ring-safety-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-safety-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-safety-600" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs capitalize text-slate-900">{detail.label}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Category Safety Advisory Card */}
        <SafetyTipsCard category={category} />

        {/* Description textarea */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label htmlFor="inc-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              2. Describe the Occurrence <span className="text-emergency-600">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {description.length}/1000
            </span>
          </div>
          <textarea
            id="inc-desc"
            rows={4}
            maxLength={1000}
            required
            placeholder="Please detail what occurred, what was taken/affected, individuals involved, or immediate support required..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full p-3.5 rounded-2xl border bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-emergency-300 focus:border-emergency-500 focus:ring-emergency-400'
                : 'border-slate-300 focus:border-safety-500 focus:ring-safety-400'
            }`}
          />
          {errors.description && (
            <p className="text-xs font-medium text-emergency-600">• {errors.description}</p>
          )}
        </div>

        {/* Location & Landmark Section */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            3. Location Coordinates &amp; Physical Landmark <span className="text-emergency-600">*</span>
          </label>

          <Input
            label="Landmark / Street Address"
            type="text"
            icon={<MapPin className="w-4 h-4" />}
            placeholder="e.g., Near Northern Gate, Red Fort Heritage Complex"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            helperText="Provides human-readable context for first responders"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Latitude (°N)"
              type="number"
              step="any"
              placeholder="e.g., 28.6139"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              required
            />
            <Input
              label="Longitude (°E)"
              type="number"
              step="any"
              placeholder="e.g., 77.2090"
              value={customLng}
              onChange={(e) => setCustomLng(e.target.value)}
              required
            />
          </div>
          {errors.location && (
            <p className="text-xs font-medium text-emergency-600">• {errors.location}</p>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Device GPS Status: <strong className="capitalize">{locationState.status}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                LocationService.getLiveLocation().then((loc) => {
                  setLocationState(loc);
                  if (loc.lat && loc.lng) {
                    setCustomLat(loc.lat.toString());
                    setCustomLng(loc.lng.toString());
                    showSuccess('Inserted live device GPS coordinates.');
                  }
                });
              }}
              className="text-safety-700 font-semibold hover:underline"
            >
              Re-detect My GPS
            </button>
          </div>
        </div>

        {/* Supporting Evidence Image Placeholder */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
            4. Supporting Photo Evidence (Optional)
          </label>

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-xs">
              <img
                src={photoPreview}
                alt="Uploaded evidence preview"
                className="w-full h-44 object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                aria-label="Remove photo"
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-2 bg-slate-900/90 text-white text-[10px] text-center font-mono">
                Prototype Local Preview (Not synced externally)
              </div>
            </div>
          ) : (
            <label
              htmlFor="evidence-upload"
              className="border-2 border-dashed border-slate-300 hover:border-safety-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-50"
            >
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Click to attach scene or document photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG or WEBP (Max 5MB • Client preview demonstration)
              </p>
              <input
                id="evidence-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="font-bold sm:min-w-[200px]"
          >
            Submit Incident Report
          </Button>
        </div>
      </form>
    </div>
  );
};
