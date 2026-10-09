import { createHash } from "node:crypto";
import { getGymCalendarDate, toIsoDate } from "@/lib/classes/class-dates";
import { Types } from "mongoose";
import sampleSchedule from "@/data/classes.json";
import FitnessClassModel from "@/database/userSchema";

export async function seedClasses(today = new Date()) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Seeding is only allowed in development.");
  }

  const date = toIsoDate(getGymCalendarDate(today));

  const records = sampleSchedule.classes.map((sample) => {
    const { id, color, ...fields } = sample;
    // A stable, seed-specific ObjectId lets later runs update the same example.
    const hexId = createHash("sha256").update(`fitness-maxxing:seed-class:${id}`).digest("hex").slice(0, 24);
    return new FitnessClassModel({ ...fields, date, _id: new Types.ObjectId(hexId) });
  });

  // Validate every example before writing any of them.
  await Promise.all(records.map((record) => record.validate()));

  for (const record of records) {
    const { _id, ...fields } = record.toObject();
    await FitnessClassModel.updateOne({ _id }, { $set: fields }, { upsert: true, runValidators: true });
  }

  return records.length;
}
