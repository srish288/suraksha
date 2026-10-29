import incidentRoutes from "./routes/incident.routes.js";
import qrRoutes from "./modules/identity/qr.routes.js";
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/qr", qrRoutes);
