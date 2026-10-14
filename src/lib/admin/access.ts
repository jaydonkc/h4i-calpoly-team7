import type { User } from "@supabase/supabase-js";
import { pageIdentity } from "@/lib/auth/page-identity";

export function isGymAdmin(user: User): boolean {
  const allowed = (process.env.GYM_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  return user.app_metadata?.role === "admin" || allowed.includes(user.id);
}

export async function adminAccess() {
  const identity = await pageIdentity();
  if (identity.unavailable) return { status: 503, message: "Authentication is temporarily unavailable." };
  if (!identity.user) return { status: 401, message: "Please log in." };
  if (!isGymAdmin(identity.user))
    return { status: 403, message: "Only gym administrators can manage classes and messages." };
  return { status: 200, user: identity.user };
}
