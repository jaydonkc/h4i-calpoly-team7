import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/memberships/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const {
      data: { user },
      error,
    } = await createClient().auth.getUser();
    if (error || !user)
      return NextResponse.json({ error: "Please log in." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    const membership = await getMembership(user.id);
    return NextResponse.json({ membership }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to load your membership. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
