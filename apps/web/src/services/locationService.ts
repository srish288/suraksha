import type { LocationState, LatLng } from '../types';

export class LocationService {
  /**
   * Request live device location from browser navigator.geolocation.
   * If permission is denied or device does not have GPS, returns clean error state.
   */
  static async getLiveLocation(): Promise<LocationState> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return {
        lat: null,
        lng: null,
        accuracy: null,
        timestamp: null,
        status: 'unavailable',
        errorMessage: 'Geolocation is not supported by your current browser or device.'
      };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: Number(position.coords.latitude.toFixed(6)),
            lng: Number(position.coords.longitude.toFixed(6)),
            accuracy: Math.round(position.coords.accuracy),
            timestamp: position.timestamp,
            status: 'granted'
          });
        },
        (error) => {
          let msg = 'Failed to retrieve location.';
          let status: LocationState['status'] = 'unavailable';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              msg = 'Location permission was denied. You can still submit reports by typing your landmark or street name.';
              status = 'denied';
              break;
            case error.POSITION_UNAVAILABLE:
              msg = 'Location information is currently unavailable from your device GPS.';
              status = 'unavailable';
              break;
            case error.TIMEOUT:
              msg = 'Location request timed out. Please check device GPS or type landmark manually.';
              status = 'unavailable';
              break;
          }

          resolve({
            lat: null,
            lng: null,
            accuracy: null,
            timestamp: null,
            status,
            errorMessage: msg
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }

  /**
   * Fallback landmark presets for quick testing when device GPS is unavailable or blocked in local dev.
   */
  static getPresetCoordinates(city: string = 'delhi'): LatLng {
    switch (city.toLowerCase()) {
      case 'mumbai':
        return { lat: 18.922, lng: 72.8347 }; // Gateway of India
      case 'jaipur':
        return { lat: 26.9239, lng: 75.8267 }; // Hawa Mahal
      case 'goa':
        return { lat: 15.4989, lng: 73.8278 }; // Panaji Heritage
      case 'delhi':
      default:
        return { lat: 28.6129, lng: 77.2295 }; // India Gate
    }
  }
}
