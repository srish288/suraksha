
import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from apps/api/.env");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected successfully");
}
