import type { Zone, ZoneType } from "@suraksha/shared";
import { ZoneModel } from "./zone.model.js";

export async function listZones(
  options: { includeInactive?: boolean } = {}
): Promise<Zone[]> {
  const filter = options.includeInactive ? {} : { active: true };
  const docs = await ZoneModel.find(filter).sort({ createdAt: 1 }).lean();

  return docs.map((d) => {
    const zone: Zone = {
      id: String(d._id),
      name: d.name,
      type: d.type as ZoneType,
      description: d.description ?? "",
      center: { lat: d.center.lat, lng: d.center.lng },
      radiusMeters: d.radiusMeters,
      alertDistanceMeters: d.alertDistanceMeters ?? 0,
      active: Boolean(d.active),
      isSample: Boolean(d.isSample)
    };

    if (d.polygon && d.polygon.length >= 3) {
      zone.polygon = d.polygon.map((p) => ({ lat: p.lat, lng: p.lng }));
    }

    return zone;
  });
}