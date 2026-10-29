import type {
  AuditAction,
  ErrorCode,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  RiskLevel,
  Role,
  ZoneType
} from "./constants.js";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    details?: ValidationIssue[];
  };
}

export type DbStatus = "connected" | "disconnected" | "not_configured";

export interface HealthResponse {
  status: "ok";
  service: string;
  time: string;
  database: DbStatus;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface TouristProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  nationality?: string;
  emergencyContact?: EmergencyContact;
  createdAt: string;
}

export interface QrResponse {
  qrPayload: string;
  qrImageDataUrl: string;
}

export interface QrVerifyResponse {
  valid: true;
  tourist: {
    name: string;
    nationality?: string;
    emergencyContact?: EmergencyContact;
  };
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  description: string;
  center: LatLng;
  radiusMeters: number;
  polygon?: LatLng[];
  alertDistanceMeters?: number;
  active?: boolean;
  isSample?: boolean;
}

export interface RiskFactor {
  code: string;
  label: string;
  points: number;
  reason: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  factors: RiskFactor[];
  assessedAt?: string;
}

export interface ZonesResponse {
  items: Zone[];
  current?: {
    zone: Zone | null;
    risk: RiskAssessment;
  };
}

export interface Incident {
  id: string;
  touristId: string;
  touristName: string;
  type: IncidentType;
  description: string;
  location: LatLng;
  status: IncidentStatus;
  severity: IncidentSeverity;
  zoneId?: string;
  risk: RiskAssessment;
  createdAt: string;
  updatedAt: string;
}

export interface ListResponse<T> {
  items: T[];
}

export interface AuditEntry {
  id: string;
  incidentId: string;
  action: AuditAction;
  actorId: string;
  actorRole: Role;
  fromStatus?: IncidentStatus;
  toStatus?: IncidentStatus;
  note?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalIncidents: number;
  openIncidents: number;
  highRiskIncidents: number;
  byStatus: Record<IncidentStatus, number>;
  recentIncidents: Incident[];
}
