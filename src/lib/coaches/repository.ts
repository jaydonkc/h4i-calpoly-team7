import connectDB from "@/database/db";
import CoachModel from "@/database/coachSchema";
import { AccountError } from "@/lib/account/http";
import type { Coach } from "@/types/coach";
import type { ClassInput } from "@/lib/classes/class-input";
import type { FitnessClass } from "@/types/fitness-class";

type Record = Omit<Coach, "id"> & { _id: string };
export async function listCoaches(): Promise<Coach[]> {
  await connectDB();
  const records = await CoachModel.find().sort({ order: 1, name: 1 }).lean<Record[]>().exec();
  return records.map(({ _id, name, specialties, bio, headshot }) => ({ id: _id, name, specialties, bio, headshot }));
}

export async function resolveClassCoach(input: ClassInput): Promise<ClassInput> {
  await connectDB();
  const coach = await CoachModel.findOne(input.coachId ? { _id: input.coachId } : { name: input.coach })
    .lean<Record>()
    .exec();
  if (!coach) throw new AccountError("Choose an instructor from the coach roster.", 400);
  return { ...input, coachId: coach._id, coach: coach.name };
}

export async function resolveCoachNames(classes: FitnessClass[]): Promise<FitnessClass[]> {
  const ids = Array.from(new Set(classes.flatMap((item) => (item.coachId ? [item.coachId] : []))));
  if (!ids.length) return classes;
  await connectDB();
  const records = await CoachModel.find({ _id: { $in: ids } })
    .lean<Record[]>()
    .exec();
  const names = new Map(records.map((coach) => [coach._id, coach.name]));
  return classes.map((item) => ({ ...item, coach: names.get(item.coachId ?? "") ?? item.coach }));
}
