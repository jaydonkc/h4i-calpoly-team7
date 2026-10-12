import { createClient } from "@/lib/supabase/server";
import { isAuthProviderUnavailable } from "./errors";
export async function pageIdentity() {
  try {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    return { user: error ? null : user, unavailable: isAuthProviderUnavailable(error) };
  } catch {
    return { user: null, unavailable: true };
  }
}
