export const ROLES = ["tourist", "authority"] as const;
export type Role = (typeof ROLES)[number];

export const INCIDENT_STATUSES = [
  "reported",
  "acknowledged",
  "in_progress",
  "resolved",
  "false_alarm"
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  reported: ["acknowledged", "false_alarm"],
  acknowledged: ["in_progress", "resolved", "false_alarm"],
  in_progress: ["resolved"],
  resolved: [],
  false_alarm: []
};

export const INCIDENT_TYPES = [
  "sos",
  "medical",
  "theft",
  "harassment",
  "lost",
  "accident",
  "other"
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const ZONE_TYPES = ["safe", "caution", "restricted" , "emergency"] as const;
export type ZoneType = (typeof ZONE_TYPES)[number];

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const AUDIT_ACTIONS = ["incident_created", "status_changed"] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_ERROR"
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];
