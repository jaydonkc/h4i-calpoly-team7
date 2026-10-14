import { NextResponse } from "next/server";
import { listCoaches } from "@/lib/coaches/repository";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json({ coaches: await listCoaches() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Coach information is temporarily unavailable." }, { status: 503 });
  }
}
