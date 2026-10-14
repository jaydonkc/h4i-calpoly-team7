import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin/access";
import { AccountError } from "@/lib/account/http";
import { validateClassInput } from "@/lib/classes/class-input";
import { archiveClass, updateClass } from "@/lib/classes/class-management";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store" };
async function manage(request: Request, action: () => Promise<unknown>) {
  const access = await adminAccess();
  if (access.status !== 200)
    return NextResponse.json({ success: false, message: access.message }, { status: access.status, headers });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ success: false, message: "Request origin is not allowed." }, { status: 403, headers });
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ success: false, message: "Send a JSON request." }, { status: 415, headers });
  try {
    const result = await action();
    return result instanceof Response ? result : NextResponse.json(result, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof AccountError ? error.message : "Unable to update the class. Please try again.",
      },
      { status: error instanceof AccountError ? error.status : 503, headers },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return manage(request, async () => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AccountError("Send valid JSON for the class.", 400);
    }
    const input = validateClassInput(body);
    if (input.fieldErrors)
      return NextResponse.json(
        { success: false, message: "Please correct the highlighted fields.", fieldErrors: input.fieldErrors },
        { status: 400, headers },
      );
    return { success: true, data: await updateClass(params.id, input.data) };
  });
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  return manage(request, async () => {
    await archiveClass(params.id);
    return { success: true };
  });
}
