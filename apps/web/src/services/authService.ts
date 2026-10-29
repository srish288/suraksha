import { apiClient, checkBackendConnection } from './api';
import { storage } from './storage';
import { DEFAULT_DEMO_TOURIST } from './mockData';
import type {
  TouristProfile,
  RegisterRequest,
  LoginRequest,
  AuthResponse
} from '../types';

export interface AuthResult {
  user: TouristProfile;
  token: string;
  isMock: boolean;
  message?: string;
}

export class AuthService {
  /**
   * Log in existing tourist.
   * If real API is up, authenticates with server.
   * If server is offline, handles via realistic client-side mock state.
   */
  static async login(data: LoginRequest): Promise<AuthResult> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();

    if (isServerUp && !forceDemo) {
      try {
        const response = await apiClient<{
          success: boolean;
          token: string;
          user: { id: string; name: string; email: string; role: string };
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify(data)
        });

        const token = response.token;
        storage.setToken(token);

        // Fetch full profile or assemble
        let fullProfile: TouristProfile;
        try {
          const meRes = await apiClient<{ success: boolean; user: TouristProfile }>(
            '/auth/me'
          );
          fullProfile = {
            ...meRes.user,
            createdAt: new Date().toISOString()
          };
        } catch {
          fullProfile = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: 'tourist',
            createdAt: new Date().toISOString()
          };
        }

        storage.setUser(fullProfile);
        return {
          user: fullProfile,
          token,
          isMock: false,
          message: 'Logged in successfully via backend server.'
        };
      } catch (err: unknown) {
        // If server returns credentials error, propagate it
        const errStatus = (err as { status?: number })?.status;
        if (errStatus && errStatus >= 400 && errStatus < 500) {
          throw err;
        }
        console.warn('Backend login encountered an error, falling back to prototype mode:', err);
      }
    }

    // Realistic Demo Mock Login
    // Simulate brief network latency for realistic feel
    await new Promise((r) => setTimeout(r, 400));

    const existingCached = storage.getUser<TouristProfile>();
    const profile: TouristProfile =
      existingCached && existingCached.email.toLowerCase() === data.email.toLowerCase()
        ? existingCached
        : {
            ...DEFAULT_DEMO_TOURIST,
            email: data.email,
            name: data.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
          };

    const mockToken = `demo_jwt_token_${Date.now()}`;
    storage.setToken(mockToken);
    storage.setUser(profile);

    return {
      user: profile,
      token: mockToken,
      isMock: true,
      message: 'Logged in under Academic Prototype Demo Mode (Backend is offline).'
    };
  }

  /**
   * Register new tourist account.
   */
  static async register(data: RegisterRequest): Promise<AuthResult> {
    const isServerUp = await checkBackendConnection();
    const forceDemo = storage.getForceDemoMode();

    if (isServerUp && !forceDemo) {
      try {
        const response = await apiClient<{
          success: boolean;
          token: string;
          user: { id: string; name: string; email: string; role: string };
        }>('/auth/register', {
          method: 'POST',
          body: JSON.stringify(data)
        });

        const token = response.token;
        storage.setToken(token);

        const profile: TouristProfile = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: 'tourist',
          phone: data.phone,
          nationality: data.nationality,
          emergencyContact: data.emergencyContact,
          createdAt: new Date().toISOString()
        };

        storage.setUser(profile);
        return {
          user: profile,
          token,
          isMock: false,
          message: 'Registered successfully in SURAKSHA database.'
        };
      } catch (err: unknown) {
        const errStatus = (err as { status?: number })?.status;
        if (errStatus && errStatus >= 400 && errStatus < 500) {
          throw err;
        }
        console.warn('Backend register encountered an error, using prototype mode:', err);
      }
    }

    // Realistic Demo Mock Registration
    await new Promise((r) => setTimeout(r, 450));

    const mockId = `tourist-${Math.floor(10000 + Math.random() * 90000)}`;
    const profile: TouristProfile = {
      id: mockId,
      name: data.name,
      email: data.email,
      role: 'tourist',
      phone: data.phone || '+91 98765 00000',
      nationality: data.nationality || 'International Visitor',
      emergencyContact: data.emergencyContact,
      createdAt: new Date().toISOString()
    };

    const mockToken = `demo_jwt_token_${Date.now()}`;
    storage.setToken(mockToken);
    storage.setUser(profile);

    return {
      user: profile,
      token: mockToken,
      isMock: true,
      message: 'Account registered in Prototype Demo State.'
    };
  }

  /**
   * Update profile fields (phone, nationality, emergency contact)
   */
  static async updateProfile(
    userId: string,
    updates: Partial<Pick<TouristProfile, 'phone' | 'nationality' | 'emergencyContact'>>
  ): Promise<TouristProfile> {
    const current = storage.getUser<TouristProfile>() || DEFAULT_DEMO_TOURIST;
    const updated: TouristProfile = {
      ...current,
      ...updates
    };

    storage.setUser(updated);
    return updated;
  }

  static logout(): void {
    storage.clearAll();
  }
}
