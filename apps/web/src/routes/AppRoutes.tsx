import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ReportIncidentPage } from '../pages/ReportIncidentPage';
import { IncidentHistoryPage } from '../pages/IncidentHistoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SafetyZonesMapPage } from '../pages/SafetyZonesMapPage';
import { TripsPage } from '../pages/TripsPage';
import { AiAssistantPage } from '../pages/AiAssistantPage';
import { AuthorityDashboardPage } from '../pages/AuthorityDashboardPage';
import { SettingsPage } from '../pages/SettingsPage';
import { EmergencyNumbersPage } from '../pages/EmergencyNumbersPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600 gap-3">
        <Loader2 className="w-8 h-8 text-safety-600 animate-spin" />
        <p className="text-xs font-semibold tracking-wide uppercase">
          Initializing SURAKSHA Safety Services...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Tourist Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportIncidentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <IncidentHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zones"
        element={
          <ProtectedRoute>
            <SafetyZonesMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AiAssistantPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authority"
        element={
          <ProtectedRoute>
            <AuthorityDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/helplines"
        element={
          <ProtectedRoute>
            <EmergencyNumbersPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback 404 */}
      <Route
        path="*"
        element={
          <AppLayout>
            <NotFoundPage />
          </AppLayout>
        }
      />
    </Routes>
  );
};
