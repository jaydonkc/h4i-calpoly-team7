import { AccountError } from "@/lib/account/http";
import { adminAccess } from "@/lib/admin/access";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import { NextResponse } from "next/server";
import { Error as MongooseError } from "mongoose";
import { validateClassInput, type ClassFieldErrors } from "@/lib/classes/class-input";

export const dynamic = "force-dynamic";

function invalidInput(fieldErrors: ClassFieldErrors) {
  return NextResponse.json(
    { success: false, message: "Please correct the highlighted fields.", fieldErrors },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const access = await adminAccess();
  if (access.status !== 200)
    return NextResponse.json(
      { success: false, message: access.message },
      { status: access.status, headers: { "Cache-Control": "private, no-store" } },
    );
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403 });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ success: false, message: "Send a JSON request." }, { status: 415 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidInput({ _form: "Send valid JSON for the class." });
  }
  const input = validateClassInput(body);
  if (input.fieldErrors) return invalidInput(input.fieldErrors);
  try {
    const saved = await classRepository.create(input.data);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    if (error instanceof AccountError) return invalidInput({ coachId: error.message });
    if (error instanceof MongooseError.ValidationError) {
      return invalidInput(
        Object.fromEntries(Object.keys(error.errors).map((field) => [field, "Enter a valid value for this field."])),
      );
    }
    return NextResponse.json(
      { success: false, message: "The class could not be saved right now. Please try again." },
      { status: 503 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const weekStart = new URL(request.url).searchParams.get("week");
    const schedule = await availableSchedule(await classRepository.getSchedule(weekStart ? { weekStart } : undefined));
    return NextResponse.json(
      { success: true, data: schedule },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "The class schedule is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
