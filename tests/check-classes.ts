import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";
import connectDB from "@/database/db";
import FitnessClass from "@/database/userSchema";

loadEnvConfig(process.cwd());

async function main() {
  try {
    await connectDB();
    console.log("database:", mongoose.connection.name);
    console.log("ping:", await mongoose.connection.db!.admin().ping());

    const count = await FitnessClass.countDocuments();
    console.log("total classes:", count);

    const first = await FitnessClass.findOne();
    console.log("first class:", first?.toJSON() ?? "none found");

    const cardioCount = await FitnessClass.countDocuments({ category: "Cardio" });
    console.log("cardio classes:", cardioCount);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  console.error("FAILED:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
