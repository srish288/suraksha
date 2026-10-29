import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TouristProfile, RegisterRequest, LoginRequest } from '../types';
import { AuthService } from '../services/authService';
import { storage } from '../services/storage';
import { checkBackendConnection } from '../services/api';
import { DEFAULT_DEMO_TOURIST } from '../services/mockData';

interface AuthContextType {
  user: TouristProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;
  isForceDemo: boolean;
  toggleDemoMode: () => void;
  login: (data: LoginRequest) => Promise<{ isMock: boolean; message?: string }>;
  register: (data: RegisterRequest) => Promise<{ isMock: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (
    updates: Partial<Pick<TouristProfile, 'phone' | 'nationality' | 'emergencyContact'>>
  ) => Promise<void>;
  refreshBackendStatus: () => Promise<boolean>;
  loadDemoTourist: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TouristProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isForceDemo, setIsForceDemo] = useState<boolean>(storage.getForceDemoMode());

  const refreshBackendStatus = useCallback(async (): Promise<boolean> => {
    const isUp = await checkBackendConnection();
    setIsBackendConnected(isUp);
    return isUp;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshBackendStatus();

      const savedToken = storage.getToken();
      const savedUser = storage.getUser<TouristProfile>();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
      } else {
        // By default, if nothing is logged in, we keep user as null so login/register screen is shown,
        // but examiners can 1-click load demo tourist.
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshBackendStatus]);

  const toggleDemoMode = useCallback(() => {
    const newVal = !isForceDemo;
    setIsForceDemo(newVal);
    storage.setForceDemoMode(newVal);
  }, [isForceDemo]);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(data);
      setUser(result.user);
      setToken(result.token);
      return { isMock: result.isMock, message: result.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const result = await AuthService.register(data);
      setUser(result.user);
      setToken(result.token);
      return { isMock: result.isMock, message: result.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = async (
    updates: Partial<Pick<TouristProfile, 'phone' | 'nationality' | 'emergencyContact'>>
  ) => {
    if (!user) return;
    const updated = await AuthService.updateProfile(user.id, updates);
    setUser(updated);
  };

  const loadDemoTourist = useCallback(() => {
    storage.setUser(DEFAULT_DEMO_TOURIST);
    storage.setToken('demo_token_aarav_sharma');
    setUser(DEFAULT_DEMO_TOURIST);
    setToken('demo_token_aarav_sharma');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isBackendConnected,
        isForceDemo,
        toggleDemoMode,
        login,
        register,
        logout,
        updateProfile,
        refreshBackendStatus,
        loadDemoTourist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
