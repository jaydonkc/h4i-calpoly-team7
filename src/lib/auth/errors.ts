import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";

export function isAuthProviderUnavailable(error: AuthError | null): boolean {
  return Boolean(error && (isAuthRetryableFetchError(error) || (error.status ?? 0) >= 500 || error.status === 429));
}

export function signInErrorMessage(error: unknown): string {
  const value = error as { code?: string; status?: number; name?: string };
  if (value?.code === "invalid_credentials" || (value?.status === 400 && value?.code !== "email_not_confirmed"))
    return "Incorrect email or password. Please try again.";
  if (value?.code === "email_not_confirmed") return "Confirm your email before logging in.";
  if (value?.status === 429) return "Too many login attempts. Please wait a moment and try again.";
  return "Unable to log in right now. Check your connection and try again.";
}
