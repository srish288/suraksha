import { Router } from "express";
import {
  assessRisk,
  evaluatePosition,
  zonesQuerySchema,
  type ApiErrorResponse,
  type ZonesResponse
} from "@suraksha/shared";
import { listZones } from "./zones.service.js";

const router = Router();

function validationError(message: string, details: { path: string; message: string }[]) {
  const body: ApiErrorResponse = {
    error: { code: "VALIDATION_ERROR", message, details }
  };
  return body;
}

// GET /api/zones  (public, no login needed)
// Optional: ?includeInactive=true
// Optional: ?lat=..&lng=..  adds `current` (zone you are in + rule-based risk)
router.get("/", async (req, res) => {
  const parsed = zonesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json(
      validationError(
        "Invalid query parameters",
        parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      )
    );
    return;
  }

  const { lat, lng } = parsed.data;

  if ((lat === undefined) !== (lng === undefined)) {
    res.status(400).json(
      validationError("Send both lat and lng, or neither", [
        { path: lat === undefined ? "lat" : "lng", message: "Required when the other is given" }
      ])
    );
    return;
  }

  try {
    const includeInactive = req.query.includeInactive === "true";
    const allZones = await listZones({ includeInactive: true });
    const items = includeInactive ? allZones : allZones.filter((z) => z.active);

    const body: ZonesResponse = { items };

    if (lat !== undefined && lng !== undefined) {
      const position = { lat, lng };
      const match = evaluatePosition(position, allZones).primary;
      body.current = {
        zone: match ? match.zone : null,
        risk: assessRisk(position, allZones)
      };
    }

    res.status(200).json(body);
  } catch (error) {
    console.error("List zones error:", error);
    const body: ApiErrorResponse = {
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch zones" }
    };
    res.status(500).json(body);
  }
});

export default router;