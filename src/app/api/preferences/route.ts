import { accountRoute, readBody } from "@/lib/account/http";
import { loadProfile, savePreferences } from "@/lib/account/profiles";
import { validatePreferences } from "@/lib/account/validation";
export const dynamic = "force-dynamic";
export const GET = accountRoute(async (_request, user) => ({ preferences: (await loadProfile(user)).preferences }));
export const PUT = accountRoute(async (request, user) => ({
  profile: await savePreferences(user, validatePreferences(await readBody(request))),
}));
