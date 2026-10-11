import { AccountError, onlyFields } from "@/lib/account/http";
import { classCategories } from "@/types/fitness-class";
import { membershipPlans, type MembershipPlan, type Preferences } from "@/types/account";

export function validateProfile(body: Record<string, unknown>) {
  onlyFields(body, ["firstName", "lastName", "phone"]);
  const read = (key: string, max: number, required = false) => {
    const value = body[key];
    if (
      typeof value !== "string" ||
      value.trim().length > max ||
      (required && !value.trim()) ||
      /[\x00-\x1f]/.test(value)
    )
      throw new AccountError("Enter valid names and phone number.");
    return value.trim();
  };
  const firstName = read("firstName", 80, true),
    lastName = read("lastName", 80, true),
    phone = read("phone", 30);
  if (
    phone &&
    (!/^[+()0-9 .-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.replace(/\D/g, "").length > 15)
  )
    throw new AccountError("Enter a valid phone number or leave it blank.");
  return { firstName, lastName, phone };
}
export function validatePreferences(body: Record<string, unknown>): Preferences {
  onlyFields(body, ["timeFormat", "defaultClassCategory"]);
  if (body.timeFormat !== "12h" && body.timeFormat !== "24h") throw new AccountError("Choose a valid time format.");
  if (
    body.defaultClassCategory !== "All" &&
    !classCategories.includes(body.defaultClassCategory as (typeof classCategories)[number])
  )
    throw new AccountError("Choose a valid default class type.");
  return {
    timeFormat: body.timeFormat,
    defaultClassCategory: body.defaultClassCategory as Preferences["defaultClassCategory"],
  };
}
export function validateReservation(body: Record<string, unknown>) {
  onlyFields(body, ["classId", "date"]);
  if (
    typeof body.classId !== "string" ||
    !/^[a-f0-9]{24}$/i.test(body.classId) ||
    typeof body.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date)
  )
    throw new AccountError("Choose a valid scheduled class.");
  return { classId: body.classId, date: body.date };
}
export function validateCheckout(body: Record<string, unknown>) {
  onlyFields(body, ["plan", "idempotencyKey"]);
  if (typeof body.plan !== "string" || !Object.hasOwn(membershipPlans, body.plan))
    throw new AccountError("Choose a valid membership plan.");
  if (
    typeof body.idempotencyKey !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.idempotencyKey)
  )
    throw new AccountError("Start a new demo checkout.");
  return { plan: body.plan as MembershipPlan, idempotencyKey: body.idempotencyKey };
}
