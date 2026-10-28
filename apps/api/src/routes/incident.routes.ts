
import { Router } from "express";
import mongoose from "mongoose";
import { Incident } from "../models/incident.model.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.middleware.js";
import { createIncidentSchema, updateIncidentStatusSchema } from "@suraksha/shared";

const router = Router();

// Tourist: report a new incident / SOS
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const parsed = createIncidentSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid incident data",
        errors: parsed.error.flatten()
      });
      return;
    }

    const incident = await Incident.create({
      ...parsed.data,
      tourist: req.user!.id
    });

    res.status(201).json({
      success: true,
      message: "Incident reported successfully",
      data: incident
    });
  } catch (error) {
    console.error("Create incident error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report incident"
    });
  }
});

// Tourist: view only their own incidents
router.get("/my", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const incidents = await Incident.find({ tourist: req.user!.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error("Get my incidents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your incidents"
    });
  }
});

// Authority: view all incidents
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  if (req.user!.role !== "authority") {
    res.status(403).json({
      success: false,
      message: "Authority access required"
    });
    return;
  }

  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 })
      .populate("tourist", "name email phone")
      .populate("assignedAuthority", "name email");

    res.status(200).json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error("Get incidents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch incidents"
    });
  }
});

// Authority: update incident status
router.patch("/:id/status", authenticateToken, async (req: AuthRequest, res) => {
  if (req.user!.role !== "authority") {
    res.status(403).json({
      success: false,
      message: "Authority access required"
    });
    return;
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({
      success: false,
      message: "Invalid incident ID"
    });
    return;
  }

  const parsed = updateIncidentStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid status update",
      errors: parsed.error.flatten()
    });
    return;
  }

  try {
    const updates: Record<string, unknown> = {
      status: parsed.data.status
    };

    if (parsed.data.status === "resolved") {
      updates.resolvedAt = new Date();
    } else {
      updates.resolvedAt = null;
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!incident) {
      res.status(404).json({
        success: false,
        message: "Incident not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Incident status updated successfully",
      data: incident
    });
  } catch (error) {
    console.error("Update incident status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update incident status"
    });
  }
});

export default router;
