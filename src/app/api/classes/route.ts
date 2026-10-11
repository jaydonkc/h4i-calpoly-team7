import connectDB from "@/database/db";
import FitnessClasses from "@/database/userSchema";
import { ClassSchedule } from "@/types/fitness-class";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  try {
    const fitnessclasses = await FitnessClasses.find().sort({ time: 1 }).orFail();
    const classschedule: ClassSchedule = {
      classes: fitnessclasses,
    };
    return NextResponse.json({ success: true, data: classschedule }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, message: "404 not found" }, { status: 503 });
  }
}
