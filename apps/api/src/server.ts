
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import incidentRoutes from "./routes/incident.routes.js";
import qrRoutes from "./modules/identity/qr.routes.js";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/qr", qrRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SURAKSHA API is running",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/health-check", healthRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`SURAKSHA API running at http://localhost:${env.PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  });
