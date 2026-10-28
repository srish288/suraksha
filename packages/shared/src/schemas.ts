import { z } from "zod";
import { INCIDENT_STATUSES, INCIDENT_TYPES } from "./constants.js";

const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);

export const locationSchema = z.strictObject({
  lat: latitude,
  lng: longitude
});

export const registerSchema = z.strictObject({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(7).max(20).optional(),
  nationality: z.string().trim().min(2).max(60).optional(),
  emergencyContact: z.strictObject({
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().min(7).max(20)
  }).optional()
});
export type RegisterRequest = z.input<typeof registerSchema>;

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72)
});
export type LoginRequest = z.input<typeof loginSchema>;

export const qrVerifySchema = z.strictObject({
  qrPayload: z.string().trim().min(8).max(200)
});
export type QrVerifyRequest = z.input<typeof qrVerifySchema>;

export const createIncidentSchema = z.strictObject({
  type: z.enum(INCIDENT_TYPES),
  description: z.string().trim().max(1000).optional(),
  location: locationSchema
});
export type CreateIncidentRequest = z.input<typeof createIncidentSchema>;

export const updateIncidentStatusSchema = z.strictObject({
  status: z.enum(INCIDENT_STATUSES),
  note: z.string().trim().max(500).optional()
});
export type UpdateIncidentStatusRequest = z.input<typeof updateIncidentStatusSchema>;

export const listIncidentsQuerySchema = z.object({
  status: z.enum(INCIDENT_STATUSES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

export const zonesQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional()
});
