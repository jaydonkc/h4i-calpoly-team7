import { accountRoute, readBody } from "@/lib/account/http";
import { loadProfile, saveProfile } from "@/lib/account/profiles";
import { validateProfile } from "@/lib/account/validation";
export const dynamic = "force-dynamic";
export const GET = accountRoute(async (_request, user) => ({ profile: await loadProfile(user) }));
export const PUT = accountRoute(async (request, user) => ({
  profile: await saveProfile(user, validateProfile(await readBody(request))),
}));
