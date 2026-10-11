import { classRepository } from "@/lib/classes/class-repository";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const schedule = await classRepository.getSchedule();
    return NextResponse.json({ success: true, data: schedule }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "The class schedule is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
