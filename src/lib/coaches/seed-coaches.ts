import CoachModel from "@/database/coachSchema";
import ClassModel from "@/database/userSchema";
import ReservationModel from "@/database/reservationSchema";
import { coaches } from "@/data/site-content";

export function coachIdForName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function seedCoaches() {
  for (const [order, coach] of Array.from(coaches.entries())) {
    const id = coachIdForName(coach.name);
    await CoachModel.updateOne({ _id: id }, { $set: { ...coach, order } }, { upsert: true, runValidators: true });
    // Preserve class IDs, dates, seats, and existing bookings while adding references.
    await ClassModel.updateMany({ coach: coach.name }, { $set: { coachId: id } });
    await ReservationModel.updateMany({ "fitnessClass.coach": coach.name }, { $set: { "fitnessClass.coachId": id } });
  }
  return coaches.length;
}
