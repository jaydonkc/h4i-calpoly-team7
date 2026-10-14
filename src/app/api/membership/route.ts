import { NextResponse } from "next/server";
import { isAuthProviderUnavailable } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/server";
import { ensureDemoMembership } from "@/lib/memberships/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    if (isAuthProviderUnavailable(error))
      return NextResponse.json(
        { error: "Unable to load your membership. Please try again." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    if (error || !user)
      return NextResponse.json({ error: "Please log in." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const membership = await ensureDemoMembership(user.id, user.email ?? "");
    return NextResponse.json({ membership }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Membership storage request failed", { name: error instanceof Error ? error.name : "UnknownError" });
    return NextResponse.json(
      { error: "Unable to load your membership. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
