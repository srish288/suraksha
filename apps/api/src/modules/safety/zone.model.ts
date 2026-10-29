import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { ZONE_TYPES } from "@suraksha/shared";

const latLngSchema = new Schema(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 }
  },
  { _id: false }
);

const zoneSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: [...ZONE_TYPES], required: true, index: true },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    center: { type: latLngSchema, required: true },
    radiusMeters: { type: Number, required: true, min: 0 },
    polygon: {
      type: [latLngSchema],
      default: undefined,
      validate: {
        validator: (points: unknown[] | undefined) =>
          points === undefined || points.length >= 3,
        message: "A polygon needs at least 3 points"
      }
    },
    alertDistanceMeters: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true, index: true },
    isSample: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export type ZoneDocument = InferSchemaType<typeof zoneSchema>;

export const ZoneModel = mongoose.model("Zone", zoneSchema);