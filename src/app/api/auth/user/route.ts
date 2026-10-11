import { NextResponse } from "next/server";
import { isAuthProviderUnavailable } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    if (isAuthProviderUnavailable(error))
      return NextResponse.json(
        { error: "Authentication is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    if (error || !user) {
      return NextResponse.json({ error: "Please log in." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
