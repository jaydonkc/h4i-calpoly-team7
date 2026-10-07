import connectDB from "./db";
import FitnessClasses from "./userSchema";
import { ClassSchedule } from "@/types/fitness-class";

export const dynamic = "force-dynamic";

export default async function GET(request: Request) {
  await connectDB();
  try {
    const fitnessclasses = await FitnessClasses.find().sort({ time: 1 }).orFail();
    const classschedule: ClassSchedule = {
      classes: fitnessclasses,
    };
    return classschedule;
  } catch (err) {
    console.error("Database read error:", err);
    return Response.json({ error: "Service currently unavailable" }, { status: 503 });
  }
}
