import mongoose, { isObjectIdOrHexString } from "mongoose";
import connectDB from "@/database/db";
import ClassModel from "@/database/userSchema";
import ReservationModel from "@/database/reservationSchema";
import OccurrenceModel from "@/database/classOccurrenceSchema";
import { AccountError } from "@/lib/account/http";
import { resolveClassCoach } from "@/lib/coaches/repository";
import type { ClassInput } from "./class-input";

export async function updateClass(id: string, input: ClassInput) {
  if (!isObjectIdOrHexString(id)) throw new AccountError("Class not found.", 404);
  const values = await resolveClassCoach(input);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const record = await ClassModel.findOne({ _id: id, archived: { $ne: true } }).session(session);
      if (!record) throw new AccountError("Class not found.", 404);
      const booked = await ReservationModel.exists({ classId: id }).session(session);
      if (
        booked &&
        (record.date !== values.date ||
          record.time.padStart(5, "0") !== values.time ||
          record.end.padStart(5, "0") !== values.end)
      )
        throw new AccountError("Cancel existing reservations before changing this class's date or time.", 409);
      if (await OccurrenceModel.exists({ classId: id, reservedCount: { $gt: values.spots } }).session(session))
        throw new AccountError("Capacity cannot be lower than the number of reservations.", 409);
      await ClassModel.updateOne(
        { _id: id },
        { $set: values, $inc: { bookingVersion: 1 } },
        { session, runValidators: true },
      );
      await OccurrenceModel.updateMany({ classId: id }, { $set: { capacity: values.spots } }, { session });
      await ReservationModel.updateMany({ classId: id }, { $set: { fitnessClass: { ...values, id } } }, { session });
    });
  } finally {
    await session.endSession();
  }
  return { ...values, id };
}

export async function archiveClass(id: string) {
  if (!isObjectIdOrHexString(id)) throw new AccountError("Class not found.", 404);
  await connectDB();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const record = await ClassModel.findOne({ _id: id, archived: { $ne: true } }).session(session);
      if (!record) throw new AccountError("Class not found.", 404);
      if (await ReservationModel.exists({ classId: id }).session(session))
        throw new AccountError("Cancel existing reservations before removing this class.", 409);
      // Retain the original record for recovery; public schedules exclude it.
      await ClassModel.updateOne({ _id: id }, { $set: { archived: true }, $inc: { bookingVersion: 1 } }, { session });
    });
  } finally {
    await session.endSession();
  }
}
