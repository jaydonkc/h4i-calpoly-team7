import mongoose from "mongoose";
import connectDB from "@/database/db";
import ReservationModel from "@/database/reservationSchema";
import OccurrenceModel from "@/database/classOccurrenceSchema";
import { classRepository } from "@/lib/classes/class-repository";
import { hasClassStarted } from "@/lib/classes/class-start";
import { AccountError } from "@/lib/account/http";
import type { FitnessClass, ClassSchedule } from "@/types/fitness-class";

export async function listReservations(userId: string): Promise<FitnessClass[]> {
  await connectDB();
  const records = await ReservationModel.find({ userId }).sort({ date: 1 }).lean();
  return records.map((record) => record.fitnessClass as FitnessClass);
}
export async function availableSchedule(schedule: ClassSchedule): Promise<ClassSchedule> {
  if (!schedule.classes.length) return schedule;
  const occurrences = await OccurrenceModel.find({
    $or: schedule.classes.map((item) => ({ classId: String(item.id), date: item.date })),
  }).lean();
  return {
    ...schedule,
    classes: schedule.classes.map((item) => {
      const occurrence = occurrences.find((record) => record.classId === String(item.id) && record.date === item.date);
      return {
        ...item,
        spots: occurrence
          ? Math.max(0, Math.min(item.spots, occurrence.capacity) - occurrence.reservedCount)
          : item.spots,
      };
    }),
  };
}
export async function reserve(userId: string, classId: string, date: string) {
  const schedule = await classRepository.getSchedule({ date });
  const fitnessClass = schedule.classes.find((item) => String(item.id) === classId && item.date === date);
  if (!fitnessClass) throw new AccountError("This class is no longer on the schedule.", 404);
  if (hasClassStarted(date, fitnessClass.time)) throw new AccountError("This class has already started.", 409);
  await Promise.all([ReservationModel.init(), OccurrenceModel.init()]);
  // Each dated occurrence has its own capacity, including legacy recurring classes.
  try {
    await OccurrenceModel.updateOne(
      { classId, date },
      { $setOnInsert: { capacity: fitnessClass.spots, reservedCount: 0 } },
      { upsert: true },
    );
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      if (await ReservationModel.findOne({ userId, classId, date }).session(session)) return;
      const seat = await OccurrenceModel.findOneAndUpdate(
        { classId, date, $expr: { $lt: ["$reservedCount", { $min: ["$capacity", fitnessClass.spots] }] } },
        { $inc: { reservedCount: 1 } },
        { session, new: true },
      );
      if (!seat) throw new AccountError("This class is full.", 409);
      await ReservationModel.create([{ userId, classId, date, fitnessClass }], { session });
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000 || !(await ReservationModel.exists({ userId, classId, date })))
      throw error;
  } finally {
    await session.endSession();
  }
  return listReservations(userId);
}
export async function cancel(userId: string, classId: string, date: string) {
  await connectDB();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const removed = await ReservationModel.findOneAndDelete({ userId, classId, date }, { session });
      if (removed)
        await OccurrenceModel.updateOne(
          { classId, date, reservedCount: { $gt: 0 } },
          { $inc: { reservedCount: -1 } },
          { session },
        );
    });
  } finally {
    await session.endSession();
  }
  return listReservations(userId);
}
