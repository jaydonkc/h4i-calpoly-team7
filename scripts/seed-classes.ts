import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import connectDB from "@/database/db";
import { seedClasses } from "@/lib/classes/seed-classes";
import { seedCoaches } from "@/lib/coaches/seed-coaches";
import { isValidClassDate } from "@/lib/classes/class-dates";

async function main() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Seeding is only allowed in development.");
  }

  loadEnvConfig(process.cwd(), true);
  const week = process.argv.find((argument) => argument.startsWith("--week="))?.slice(7);
  if (week && !isValidClassDate(week)) throw new Error("Use --week=YYYY-MM-DD with a real calendar date.");

  try {
    await connectDB();
    await seedCoaches();
    const count = await seedClasses(week ? new Date(`${week}T12:00:00Z`) : new Date());
    console.log(`Seeded ${count} classes across ${week ? "the requested" : "the current"} week.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
