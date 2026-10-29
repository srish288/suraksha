import type {
  Role,
  IncidentStatus,
  IncidentType,
  IncidentSeverity,
  TouristProfile,
  EmergencyContact,
  Incident,
  LatLng,
  Zone,
  ZoneType,
  RegisterRequest,
  LoginRequest,
  AuthResponse
} from '@suraksha/shared';

export type {
  Role,
  IncidentStatus,
  IncidentType,
  IncidentSeverity,
  TouristProfile,
  EmergencyContact,
  Incident,
  LatLng,
  Zone,
  ZoneType,
  RegisterRequest,
  LoginRequest,
  AuthResponse
};

export interface UiIncident extends Omit<Incident, 'touristId' | 'touristName' | 'risk'> {
  touristId?: string;
  touristName?: string;
  landmark?: string;
  photoUrl?: string;
  isDemo?: boolean;
  unsynced?: boolean;
  notes?: string[];
  risk?: {
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: Array<{ code: string; label: string; points: number; reason: string }>;
  };
}

export interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  timestamp: number | null;
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
  errorMessage?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export interface SafetyZoneInfo {
  id: string;
  name: string;
  type: 'safe' | 'caution' | 'restricted';
  description: string;
  advisory: string;
  helpline: string;
  policeStation: string;
}

export interface DashboardSummary {
  total: number;
  open: number;
  sos: number;
  resolved: number;
}

export interface AuthorityStatusUpdate {
  status: IncidentStatus;
  note?: string;
}

