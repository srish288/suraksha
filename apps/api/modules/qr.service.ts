
import { createHash, randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { QrIdentity } from "./qr.model.js";

const QR_VALIDITY_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createTouristQr(touristId: string) {
  // Generate a high-entropy secret for the QR.
  const token = randomBytes(32).toString("base64url");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + QR_VALIDITY_DAYS);

  await QrIdentity.create({
    touristId,
    tokenHash: hashToken(token),
    expiresAt
  });

  // The QR contains only the opaque token, never personal details.
  const qrImageDataUrl = await QRCode.toDataURL(token);

  return {
    qrPayload: token,
    qrImageDataUrl,
    expiresAt: expiresAt.toISOString()
  };
}
