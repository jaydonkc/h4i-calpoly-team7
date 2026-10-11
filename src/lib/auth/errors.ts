import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";

export function isAuthProviderUnavailable(error: AuthError | null): boolean {
  return Boolean(error && (isAuthRetryableFetchError(error) || (error.status ?? 0) >= 500 || error.status === 429));
}
