import mongoose from "mongoose";
import connectDB from "src/database/db.ts";

async function main() {
  await connectDB();
  console.log("readyState:", mongoose.connection.readyState); // 1 = connected
  console.log("database:", mongoose.connection.name);
  console.log("ping:", await mongoose.connection.db!.admin().ping()); // { ok: 1 }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
