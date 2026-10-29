
import { createHash } from "node:crypto";
import { Router, type Response } from "express";
import mongoose from "mongoose";
import { qrVerifySchema } from "@suraksha/shared";
import { User } from "../../models/user.model.js";
import { authenticateToken, type AuthRequest } from "../../middleware/auth.middleware.js";
import { QrIdentity } from "./qr.model.js";
import { createTouristQr } from "./qr.service.js";

const router = Router();

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// Generate a new QR identity for the logged-in tourist.
router.post("/generate", authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "tourist") {
    res.status(403).json({ success: false, message: "Tourist access required" });
    return;
  }

  try {
    const tourist = await User.findById(req.user!.id).select("_id");

    if (!tourist) {
      res.status(404).json({ success: false, message: "Tourist not found" });
      return;
    }

    // Revoke existing active QR identities before creating a replacement.
    await QrIdentity.updateMany(
      { touristId: tourist._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    const qr = await createTouristQr(tourist.id);

    res.status(201).json({ success: true, data: qr });
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ success: false, message: "Failed to generate QR" });
  }
});

// Verify an opaque QR token. Only authenticated authorities may verify it.
router.post("/verify", authenticateToken, async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== "authority") {
    res.status(403).json({ success: false, message: "Authority access required" });
    return;
  }

  const parsed = qrVerifySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid QR payload",
      errors: parsed.error.flatten()
    });
    return;
  }

  try {
    const tokenHash = hashToken(parsed.data.qrPayload);

    const identity = await QrIdentity.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!identity || !mongoose.isValidObjectId(identity.touristId)) {
      res.status(404).json({ success: false, message: "QR is invalid or expired" });
      return;
    }

    const tourist = await User.findById(identity.touristId)
      .select("name nationality");

    if (!tourist) {
      res.status(404).json({ success: false, message: "QR is invalid or expired" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        tourist: {
          name: tourist.name,
          ...(tourist.nationality ? { nationality: tourist.nationality } : {})
        }
      }
    });
  } catch (error) {
    console.error("Verify QR error:", error);
    res.status(500).json({ success: false, message: "Failed to verify QR" });
  }
});

export default router;
