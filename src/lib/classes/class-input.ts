import { isValidClassDate } from "@/lib/classes/class-dates";
import { classCategories, type FitnessClass } from "@/types/fitness-class";

export type ClassInput = Omit<FitnessClass, "id">;
export type ClassFieldErrors = Record<string, string>;
const textFields = [
  "date",
  "title",
  "category",
  "time",
  "end",
  "coach",
  "room",
  "level",
  "duration",
  "description",
] as const;
const writableFields = new Set<string>([...textFields, "spots", "location"]);

export function validateClassInput(
  value: unknown,
): { data: ClassInput; fieldErrors?: never } | { data?: never; fieldErrors: ClassFieldErrors } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { fieldErrors: { _form: "Send a JSON object containing the class fields." } };
  }
  const input = value as Record<string, unknown>;
  const fieldErrors: ClassFieldErrors = Object.create(null);
  const data: Record<string, unknown> = {};
  for (const field of Object.keys(input)) {
    if (!writableFields.has(field)) fieldErrors[field] = "This field is not writable. Remove it.";
  }
  for (const field of textFields) {
    const text = typeof input[field] === "string" ? input[field].trim() : "";
    if (!text) fieldErrors[field] = "Enter a nonempty text value.";
    else data[field] = text;
  }
  if (input.location !== undefined) {
    if (typeof input.location !== "string" || !input.location.trim() || input.location.length > 120)
      fieldErrors.location = "Enter a location up to 120 characters.";
    else data.location = input.location.trim();
  }
  for (const field of textFields) {
    if (typeof data[field] === "string" && (data[field] as string).length > (field === "description" ? 2000 : 160))
      fieldErrors[field] = "This value is too long.";
  }
  if (data.date && !isValidClassDate(data.date as string)) fieldErrors.date = "Enter a real date as YYYY-MM-DD.";
  if (data.category && !classCategories.includes(data.category as ClassInput["category"])) {
    fieldErrors.category = "Choose Strength, Cardio, or Mind & Body.";
  }
  if (data.level && !["All levels", "Beginner", "Intermediate", "Advanced"].includes(data.level as string)) {
    fieldErrors.level = "Choose All levels, Beginner, Intermediate, or Advanced.";
  }
  for (const field of ["time", "end"] as const) {
    if (data[field] && !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(data[field] as string)) {
      fieldErrors[field] = "Enter a 24-hour time as HH:mm (00:00–23:59).";
    }
  }
  if (data.time && data.end && !fieldErrors.time && !fieldErrors.end && (data.end as string) <= (data.time as string)) {
    fieldErrors.end = "End time must be after start time on the same day.";
  }
  if (typeof input.spots !== "number" || !Number.isSafeInteger(input.spots) || input.spots < 0) {
    fieldErrors.spots = "Enter a nonnegative whole number of spots.";
  } else data.spots = input.spots;
  return Object.keys(fieldErrors).length ? { fieldErrors } : { data: data as ClassInput };
}
