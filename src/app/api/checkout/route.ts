import { accountRoute, readBody } from "@/lib/account/http";
import { listOrders, demoCheckout } from "@/lib/account/checkout";
import { validateCheckout } from "@/lib/account/validation";
export const dynamic = "force-dynamic";
export const GET = accountRoute(async (_request, user) => ({ orders: await listOrders(user.id) }));
export const POST = accountRoute(async (request, user) => {
  const { plan, idempotencyKey } = validateCheckout(await readBody(request));
  return demoCheckout(user.id, user.email ?? "", plan, idempotencyKey);
});
