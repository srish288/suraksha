import authRoutes from "../../routes/auth.routes.js";
import incidentRoutes from "../../routes/incident.routes.js";
import qrRoutes from "./qr.routes.js";
import type { Express } from "express";

export function registerIdentityRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/incidents", incidentRoutes);
  app.use("/api/qr", qrRoutes);
}
