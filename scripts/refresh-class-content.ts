import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import connectDB from "@/database/db";
import ClassModel from "@/database/userSchema";
import lineup from "@/data/classes.json";
import { gymLocations } from "@/data/site-content";

async function main() {
  if (process.env.NODE_ENV !== "development") throw new Error("Content refresh is only allowed in development.");
  loadEnvConfig(process.cwd(), true);
  try {
    await connectDB();
    const locations = gymLocations.map((location) => location.name as string);
    let updated = 0;
    for (const template of lineup.classes) {
      const records = await ClassModel.find({ title: template.title }).lean<
        Array<{ _id: unknown; location?: string; time: string; end: string }>
      >();
      for (const record of records) {
        const result = await ClassModel.updateOne(
          { _id: record._id },
          {
            $set: {
              coach: template.coach,
              description: template.description,
              time: record.time.padStart(5, "0"),
              end: record.end.padStart(5, "0"),
              location: record.location && locations.includes(record.location) ? record.location : template.location,
            },
          },
          { runValidators: true },
        );
        updated += result.modifiedCount;
      }
    }
    console.log(`Updated ${updated} existing classes. IDs, dates, capacity, and reservations were preserved.`);
  } finally {
    await mongoose.disconnect();
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Content refresh failed.");
  process.exitCode = 1;
});
