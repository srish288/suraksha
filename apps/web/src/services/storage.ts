/**
 * Safe client-side storage utility.
 * Stores auth token and non-sensitive UI state.
 * Never stores passwords or cryptographic secrets.
 */

const TOKEN_KEY = 'suraksha_auth_token';
const USER_KEY = 'suraksha_tourist_profile';
const MOCK_INCIDENTS_KEY = 'suraksha_demo_incidents';
const MODE_PREF_KEY = 'suraksha_force_demo_mode';

export const storage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string, remember: boolean = true): void {
    try {
      if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        sessionStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  getUser<T>(): T | null {
    try {
      const data = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T, remember: boolean = true): void {
    try {
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem(USER_KEY, serialized);
      } else {
        sessionStorage.setItem(USER_KEY, serialized);
      }
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  clearUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  getMockIncidents<T>(): T | null {
    try {
      const data = localStorage.getItem(MOCK_INCIDENTS_KEY);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  },

  setMockIncidents<T>(incidents: T): void {
    try {
      localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  getForceDemoMode(): boolean {
    try {
      return localStorage.getItem(MODE_PREF_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setForceDemoMode(value: boolean): void {
    try {
      localStorage.setItem(MODE_PREF_KEY, String(value));
    } catch (e) {
      console.warn('Storage unavailable:', e);
    }
  },

  clearAll(): void {
    this.clearToken();
    this.clearUser();
  }
};
