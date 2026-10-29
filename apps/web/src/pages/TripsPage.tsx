import React, { useState, useEffect } from 'react';
import { TripService, type TripItinerary, type SavedPlace } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import {
  Compass,
  Building,
  Phone,
  MapPin,
  Calendar,
  Share2,
  PlusCircle,
  Trash2,
  ShieldCheck,
  Building2,
  HeartPulse,
  Landmark,
  Train
} from 'lucide-react';

export const TripsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [trip, setTrip] = useState<TripItinerary>(TripService.getActiveTrip());
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);

  // Form states for adding place
  const [placeName, setPlaceName] = useState('');
  const [placeCategory, setPlaceCategory] = useState<SavedPlace['category']>('hotel');
  const [placeAddress, setPlaceAddress] = useState('');
  const [placePhone, setPlacePhone] = useState('');

  // Form states for editing trip
  const [tripTitle, setTripTitle] = useState(trip.tripTitle);
  const [destinationCity, setDestinationCity] = useState(trip.destinationCity);
  const [hotelName, setHotelName] = useState(trip.hotelName);
  const [hotelAddress, setHotelAddress] = useState(trip.hotelAddress);
  const [hotelPhone, setHotelPhone] = useState(trip.hotelPhone);

  const handleShareItinerary = () => {
    const guardianPhone = user?.emergencyContact?.phone || '';
    const shareText = encodeURIComponent(
      `SURAKSHA Tourist Safety Update from ${user?.name || 'Tourist'}:\n` +
      `Trip: ${trip.tripTitle} (${trip.destinationCity})\n` +
      `Staying At: ${trip.hotelName}\n` +
      `Hotel Address: ${trip.hotelAddress}\n` +
      `Hotel Phone: ${trip.hotelPhone}\n` +
      `Current Safety Status: Protected via SURAKSHA system.`
    );

    if (navigator.share) {
      navigator.share({
        title: `SURAKSHA Itinerary: ${trip.tripTitle}`,
        text: decodeURIComponent(shareText)
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    }
  };

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName.trim() || !placeAddress.trim()) {
      showError('Please provide both name and address.');
      return;
    }

    const updated = TripService.addSavedPlace({
      name: placeName.trim(),
      category: placeCategory,
      address: placeAddress.trim(),
      phone: placePhone.trim() || undefined
    });

    setTrip(updated);
    setIsAddPlaceOpen(false);
    setPlaceName('');
    setPlaceAddress('');
    setPlacePhone('');
    showSuccess('Safe place saved to your local offline registry.');
  };

  const handleRemovePlace = (id: string) => {
    const updated = TripService.removeSavedPlace(id);
    setTrip(updated);
    showSuccess('Place removed from itinerary.');
  };

  const handleUpdateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TripItinerary = {
      ...trip,
      tripTitle,
      destinationCity,
      hotelName,
      hotelAddress,
      hotelPhone
    };
    TripService.saveTrip(updated);
    setTrip(updated);
    setIsEditTripOpen(false);
    showSuccess('Trip details updated successfully.');
  };

  const getCategoryIcon = (cat: SavedPlace['category']) => {
    switch (cat) {
      case 'hotel':
        return <Building className="w-5 h-5 text-safety-600" />;
      case 'police':
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case 'hospital':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'embassy':
        return <Landmark className="w-5 h-5 text-purple-600" />;
      case 'transit':
        return <Train className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-safety-50 border border-safety-100 flex items-center justify-center text-safety-600 shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Active Trip &amp; Saved Safe Places
            </h1>
            <p className="text-xs text-slate-500">
              Offline-cached travel base, verified hotel contacts, and guardian location sharing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 className="w-4 h-4 text-safety-600" />}
            onClick={handleShareItinerary}
          >
            Share with Guardian
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditTripOpen(true)}
          >
            Edit Trip Info
          </Button>
        </div>
      </div>

      {/* Active Trip Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-safety-500/20 text-safety-400 border border-safety-400/30">
              Active Itinerary
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1 text-white">
              {trip.tripTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-safety-400" /> {trip.destinationCity}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <Calendar className="w-3.5 h-3.5 text-safety-400" />
            <span>{trip.startDate} to {trip.endDate}</span>
          </div>
        </div>

        {/* Base Stay & Hotel Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-safety-400" /> Primary Stay / Hotel
            </span>
            <p className="font-bold text-sm text-white">{trip.hotelName}</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">{trip.hotelAddress}</p>
            <div className="pt-2 flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-safety-400" />
              <a href={`tel:${trip.hotelPhone}`} className="hover:underline font-mono font-semibold">
                {trip.hotelPhone}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-safety-400" /> Offline Safety Guarantee
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                This hotel address and contact info is stored locally on your device. You can show this card to taxi drivers or police even with nil network connectivity.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleShareItinerary}
                className="inline-flex items-center gap-1.5 text-safety-400 text-xs font-bold hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Quick WhatsApp Itinerary Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Safe Places Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Verified Safe Places &amp; Contacts</h3>
          <p className="text-xs text-slate-500">Quick-dial hubs stored for offline access</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<PlusCircle className="w-4 h-4 text-safety-600" />}
          onClick={() => setIsAddPlaceOpen(true)}
        >
          Add Place
        </Button>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trip.savedPlaces.map((place) => (
          <div
            key={place.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getCategoryIcon(place.category)}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePlace(place.id)}
                  title="Remove"
                  className="text-slate-300 hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {place.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900">{place.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {place.address}
                </p>
              </div>
            </div>

            {place.phone && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={`tel:${place.phone}`}
                  className="inline-flex items-center gap-1.5 font-bold text-safety-700 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {place.phone}</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Place Modal */}
      <Modal
        isOpen={isAddPlaceOpen}
        onClose={() => setIsAddPlaceOpen(false)}
        title="Add Verified Safe Place"
      >
        <form onSubmit={handleAddPlace} className="space-y-4">
          <Input
            label="Place Name"
            placeholder="e.g., German Embassy / Max Hospital"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Category
            </label>
            <select
              value={placeCategory}
              onChange={(e) => setPlaceCategory(e.target.value as SavedPlace['category'])}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-safety-500"
            >
              <option value="hotel">Hotel / Accommodation</option>
              <option value="embassy">Foreign Embassy / High Commission</option>
              <option value="police">Police Station / Tourist Kiosk</option>
              <option value="hospital">Hospital / Emergency Clinic</option>
              <option value="transit">Metro / Railway Station Hub</option>
            </select>
          </div>

          <Input
            label="Physical Street Address"
            placeholder="e.g., Shantipath, Chanakyapuri, New Delhi"
            value={placeAddress}
            onChange={(e) => setPlaceAddress(e.target.value)}
            required
          />

          <Input
            label="Contact Phone (Optional)"
            placeholder="e.g., +91 11 4419 9000"
            value={placePhone}
            onChange={(e) => setPlacePhone(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsAddPlaceOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Save Place
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal
        isOpen={isEditTripOpen}
        onClose={() => setIsEditTripOpen(false)}
        title="Edit Active Trip Information"
      >
        <form onSubmit={handleUpdateTrip} className="space-y-4">
          <Input
            label="Trip Title"
            value={tripTitle}
            onChange={(e) => setTripTitle(e.target.value)}
            required
          />
          <Input
            label="Destination City / Region"
            value={destinationCity}
            onChange={(e) => setDestinationCity(e.target.value)}
            required
          />
          <Input
            label="Hotel Name"
            value={hotelName}
            onChange={(e) => setHotelName(e.target.value)}
            required
          />
          <Input
            label="Hotel Address"
            value={hotelAddress}
            onChange={(e) => setHotelAddress(e.target.value)}
            required
          />
          <Input
            label="Hotel Telephone"
            value={hotelPhone}
            onChange={(e) => setHotelPhone(e.target.value)}
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsEditTripOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Save Trip
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
