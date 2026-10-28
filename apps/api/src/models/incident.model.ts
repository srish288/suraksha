
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const incidentSchema = new Schema(
  {
    tourist: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        "sos",
        "medical",
        "theft",
        "harassment",
        "lost",
        "accident",
        "other"
      ],
      required: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high",
      required: true
    },
    status: {
      type: String,
      enum: [
        "reported",
        "acknowledged",
        "in_progress",
        "resolved",
        "false_alarm"
      ],
      default: "reported",
      required: true,
      index: true
    },
    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      },
      address: {
        type: String,
        trim: true,
        maxlength: 250,
        default: ""
      }
    },
    assignedAuthority: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

incidentSchema.index({ status: 1, createdAt: -1 });

export type IncidentDocument = InferSchemaType<typeof incidentSchema>;

export const Incident = mongoose.model("Incident", incidentSchema);
