import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import connectDB from "@/database/db";
import { seedCoaches } from "@/lib/coaches/seed-coaches";

async function main() {
  if (process.env.NODE_ENV !== "development") throw new Error("Seeding is only allowed in development.");
  loadEnvConfig(process.cwd(), true);
  try {
    await connectDB();
    console.log(`Saved ${await seedCoaches()} coaches and linked existing classes and reservations.`);
  } finally {
    await mongoose.disconnect();
  }
}
main().catch(() => {
  console.error("Coach initialization failed. Check database connectivity and retry.");
  process.exitCode = 1;
});
