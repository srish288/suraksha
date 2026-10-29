
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const qrIdentitySchema = new Schema(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      select: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export type QrIdentityDocument = InferSchemaType<
  typeof qrIdentitySchema
>;

export const QrIdentity = mongoose.model(
  "QrIdentity",
  qrIdentitySchema
);
