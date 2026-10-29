import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../../config/db.js";
import { ZoneModel } from "./zone.model.js";
import { SAMPLE_ZONES } from "./sample-zones.js";

async function main(): Promise<void> {
  await connectDB();

  // Only replaces sample zones. Other zones are not touched.
  const removed = await ZoneModel.deleteMany({ isSample: true });
  const created = await ZoneModel.insertMany(SAMPLE_ZONES);

  console.log(`Removed ${removed.deletedCount} old sample zones`);
  console.log(`Inserted ${created.length} sample zones`);

  await mongoose.disconnect();
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});