export interface SavedPlace {
  id: string;
  name: string;
  category: 'hotel' | 'embassy' | 'police' | 'hospital' | 'transit';
  address: string;
  phone?: string;
  landmark?: string;
}

export interface TripItinerary {
  id: string;
  tripTitle: string;
  destinationCity: string;
  startDate: string;
  endDate: string;
  hotelName: string;
  hotelAddress: string;
  hotelPhone: string;
  embassyPhone?: string;
  savedPlaces: SavedPlace[];
  status: 'active' | 'upcoming' | 'completed';
}

const TRIP_STORAGE_KEY = 'suraksha_tourist_trip_data';

export const DEFAULT_SAMPLE_TRIP: TripItinerary = {
  id: 'trip-delhi-2026',
  tripTitle: 'Golden Triangle Heritage Exploration',
  destinationCity: 'New Delhi, India',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  hotelName: 'The Imperial Heritage Hotel',
  hotelAddress: 'Janpath, Connaught Place, New Delhi 110001',
  hotelPhone: '+91 11 2334 1234',
  embassyPhone: '+91 11 2419 8000',
  status: 'active',
  savedPlaces: [
    {
      id: 'place-1',
      name: 'The Imperial Hotel (Base Stay)',
      category: 'hotel',
      address: 'Janpath, Connaught Place, New Delhi',
      phone: '+91 11 2334 1234'
    },
    {
      id: 'place-2',
      name: 'Connaught Place Police Station',
      category: 'police',
      address: 'Near Baba Kharak Singh Marg, New Delhi',
      phone: '011-23743000'
    },
    {
      id: 'place-3',
      name: 'Dr. Ram Manohar Lohia Hospital',
      category: 'hospital',
      address: 'Baba Kharak Singh Marg, New Delhi',
      phone: '011-23365525'
    }
  ]
};

export class TripService {
  public static getActiveTrip(): TripItinerary {
    try {
      const data = localStorage.getItem(TRIP_STORAGE_KEY);
      return data ? (JSON.parse(data) as TripItinerary) : DEFAULT_SAMPLE_TRIP;
    } catch {
      return DEFAULT_SAMPLE_TRIP;
    }
  }

  public static saveTrip(trip: TripItinerary): void {
    try {
      localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip));
    } catch (e) {
      console.warn('Failed to save trip to localStorage:', e);
    }
  }

  public static addSavedPlace(place: Omit<SavedPlace, 'id'>): TripItinerary {
    const current = this.getActiveTrip();
    const newPlace: SavedPlace = {
      ...place,
      id: `place-${Date.now()}`
    };
    const updated = {
      ...current,
      savedPlaces: [newPlace, ...current.savedPlaces]
    };
    this.saveTrip(updated);
    return updated;
  }

  public static removeSavedPlace(id: string): TripItinerary {
    const current = this.getActiveTrip();
    const updated = {
      ...current,
      savedPlaces: current.savedPlaces.filter((p) => p.id !== id)
    };
    this.saveTrip(updated);
    return updated;
  }
}
