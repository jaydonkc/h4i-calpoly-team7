import { afterEach, expect, it, vi } from "vitest";
import { adminAccess } from "@/lib/admin/access";
import { updateClass, archiveClass } from "@/lib/classes/class-management";
import { PATCH, DELETE } from "@/app/api/classes/[id]/route";
import { AccountError } from "@/lib/account/http";

vi.mock("@/lib/admin/access", () => ({ adminAccess: vi.fn(async () => ({ status: 200 })) }));
vi.mock("@/lib/classes/class-management", () => ({ updateClass: vi.fn(), archiveClass: vi.fn() }));
afterEach(() => vi.clearAllMocks());
const params = { params: { id: "012345678901234567890123" } };
const input = {
  date: "2026-10-19",
  title: "Staff class",
  category: "Strength" as const,
  time: "09:00",
  end: "10:00",
  coach: "Jaydon Chen",
  coachId: "jaydon-chen",
  room: "Studio",
  level: "All levels",
  duration: "60 min",
  spots: 10,
  description: "A staff-created class",
};
const request = (method: string, body = input) =>
  new Request(`http://localhost/api/classes/${params.params.id}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

it.each([401, 403, 503])("protects updates/removal before any storage call (%s)", async (status) => {
  vi.mocked(adminAccess).mockResolvedValueOnce({ status, message: "Denied" });
  expect((await PATCH(request("PATCH"), params)).status).toBe(status);
  vi.mocked(adminAccess).mockResolvedValueOnce({ status, message: "Denied" });
  expect((await DELETE(request("DELETE"), params)).status).toBe(status);
  expect(updateClass).not.toHaveBeenCalled();
  expect(archiveClass).not.toHaveBeenCalled();
});
it("returns field validation as 400 instead of wrapping it in a successful response", async () => {
  const response = await PATCH(request("PATCH", { ...input, spots: -1 }), params);
  expect(response.status).toBe(400);
  expect((await response.json()).fieldErrors.spots).toBeDefined();
  expect(updateClass).not.toHaveBeenCalled();
});
it("rejects cross-origin writes", async () => {
  const req = request("DELETE");
  req.headers.set("origin", "https://elsewhere.example");
  expect((await DELETE(req, params)).status).toBe(403);
  expect(archiveClass).not.toHaveBeenCalled();
});
it("only reports an updated class after the repository completes", async () => {
  vi.mocked(updateClass).mockResolvedValueOnce({ ...input, id: params.params.id });
  const response = await PATCH(request("PATCH"), params);
  expect(response.status).toBe(200);
  expect((await response.json()).data.id).toBe(params.params.id);
});
it("returns a conflict for removal of a booked class", async () => {
  vi.mocked(archiveClass).mockRejectedValueOnce(new AccountError("Cancel existing reservations first.", 409));
  expect((await DELETE(request("DELETE"), params)).status).toBe(409);
});
it("hides storage failure details", async () => {
  vi.mocked(updateClass).mockRejectedValueOnce(new Error("private database detail"));
  const response = await PATCH(request("PATCH"), params);
  expect(response.status).toBe(503);
  expect(JSON.stringify(await response.json())).not.toContain("private database detail");
});
