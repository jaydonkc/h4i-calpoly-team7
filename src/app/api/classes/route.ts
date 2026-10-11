import connectDB from "./db";
import FitnessClasses from "./userSchema";
import { ClassSchedule } from "@/types/fitness-class";

export async function GET() {
  await connectDB();
  try {
    const fitnessclasses = await FitnessClasses.find().sort({ time: 1 }).orFail();
    const classschedule: ClassSchedule = {
      classes: fitnessclasses,
    };
    return NextResponse.json({ success: true, data: classschedule }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, message: "404 not found" }, { status: 503 });
  }
}
