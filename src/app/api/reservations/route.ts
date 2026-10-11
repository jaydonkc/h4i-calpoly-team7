import { accountRoute, readBody } from "@/lib/account/http";
import { listReservations, reserve, cancel } from "@/lib/account/reservations";
import { validateReservation } from "@/lib/account/validation";
export const dynamic = "force-dynamic";
export const GET = accountRoute(async (_request, user) => ({ reservations: await listReservations(user.id) }));
export const POST = accountRoute(async (request, user) => {
  const { classId, date } = validateReservation(await readBody(request));
  return { reservations: await reserve(user.id, classId, date) };
});
export const DELETE = accountRoute(async (request, user) => {
  const { classId, date } = validateReservation(await readBody(request));
  return { reservations: await cancel(user.id, classId, date) };
});
