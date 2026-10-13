import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import connectDB from "@/database/db";
import { seedClasses } from "@/lib/classes/seed-classes";

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Seeding is only allowed in development.");
  }

  loadEnvConfig(process.cwd(), true);

  try {
    await connectDB();
    const count = await seedClasses();
    console.log(`Seeded ${count} classes across the current week.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
