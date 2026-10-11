import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let destination = request.nextUrl.searchParams.get("next");
  if (!destination) {
    try {
      destination = decodeURIComponent(request.cookies.get("fm-auth-next")?.value ?? "");
    } catch {
      destination = null;
    }
  }
  const next = safeNextPath(destination);
  if (code) {
    try {
      const { error } = await createClient().auth.exchangeCodeForSession(code);
      if (!error) {
        const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
        response.cookies.set("fm-auth-next", "", { path: "/auth/callback", maxAge: 0 });
        response.headers.set("Cache-Control", "private, no-store");
        return response;
      }
    } catch {
      // Show a recoverable error without exposing provider details or tokens.
    }
  }
  return NextResponse.redirect(new URL("/profile?authError=callback", request.nextUrl.origin));
}
