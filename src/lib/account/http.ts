import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAuthProviderUnavailable } from "@/lib/auth/errors";

export class AccountError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const headers = { "Cache-Control": "private, no-store" };
export function accountRoute(action: (request: NextRequest, user: User) => Promise<unknown>) {
  return async (request: NextRequest) => {
    try {
      // Cookie-authenticated mutations must originate from this site and send JSON.
      if (request.method !== "GET") {
        const origin = request.headers.get("origin");
        if (origin && origin !== request.nextUrl.origin) throw new AccountError("Request origin is not allowed.", 403);
        if (!request.headers.get("content-type")?.startsWith("application/json"))
          throw new AccountError("Send a JSON request.", 415);
      }
      const {
        data: { user },
        error,
      } = await createClient().auth.getUser();
      if (isAuthProviderUnavailable(error))
        throw new AccountError("Authentication is temporarily unavailable. Please try again.", 503);
      if (error || !user) throw new AccountError("Please log in.", 401);
      return NextResponse.json(await action(request, user), { headers });
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof AccountError ? error.message : "Unable to save or load your account. Please try again.",
        },
        { status: error instanceof AccountError ? error.status : 503, headers },
      );
    }
  };
}
export async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new AccountError("Enter valid account data.");
  }
}
export function onlyFields(body: Record<string, unknown>, fields: string[]) {
  if (Object.keys(body).some((key) => !fields.includes(key))) throw new AccountError("Unexpected account field.");
}
