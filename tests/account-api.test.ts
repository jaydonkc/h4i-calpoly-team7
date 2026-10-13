import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AuthRetryableFetchError } from "@supabase/supabase-js";
import { GET as profileGet, PUT as profilePut } from "@/app/api/profile/route";
import { GET as preferencesGet, PUT as preferencesPut } from "@/app/api/preferences/route";
import {
  GET as reservationsGet,
  POST as reservationsPost,
  DELETE as reservationsDelete,
} from "@/app/api/reservations/route";
import { GET as ordersGet, POST as checkoutPost } from "@/app/api/checkout/route";
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
  savePreferences: vi.fn(),
  listReservations: vi.fn(),
  reserve: vi.fn(),
  cancel: vi.fn(),
  listOrders: vi.fn(),
  demoCheckout: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock("@/lib/account/profiles", () => ({
  loadProfile: mocks.loadProfile,
  saveProfile: mocks.saveProfile,
  savePreferences: mocks.savePreferences,
}));
vi.mock("@/lib/account/reservations", () => ({
  listReservations: mocks.listReservations,
  reserve: mocks.reserve,
  cancel: mocks.cancel,
}));
vi.mock("@/lib/account/checkout", () => ({ listOrders: mocks.listOrders, demoCheckout: mocks.demoCheckout }));
const user = { id: "verified-owner", email: "owner@example.com" };
const request = (method = "GET", body?: unknown, origin = "https://gym.example") =>
  new NextRequest("https://gym.example/api/account", {
    method,
    headers: { "content-type": "application/json", origin },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user }, error: null });
});
describe("account ownership and validation", () => {
  it.each([
    profileGet,
    profilePut,
    preferencesGet,
    preferencesPut,
    reservationsGet,
    reservationsPost,
    reservationsDelete,
    ordersGet,
    checkoutPost,
  ])("rejects signed-out requests before touching account data", async (handler) => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await handler(request())).status).toBe(401);
    for (const [name, mock] of Object.entries(mocks)) if (name !== "getUser") expect(mock).not.toHaveBeenCalled();
  });
  it("does not use a query parameter to select another account", async () => {
    mocks.loadProfile.mockResolvedValue({ userId: user.id });
    const response = await profileGet(new NextRequest("https://gym.example/api/profile?userId=someone-else"));
    expect(mocks.loadProfile).toHaveBeenCalledWith(user);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects profile identity injection", async () => {
    const response = await profilePut(
      request("PUT", { firstName: "A", lastName: "B", phone: "", userId: "someone-else" }),
    );
    expect(response.status).toBe(400);
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });
  it("saves validated names and phone under the verified owner", async () => {
    mocks.saveProfile.mockResolvedValue({ userId: user.id });
    expect(
      (await profilePut(request("PUT", { firstName: " A ", lastName: "B", phone: "(805) 555-0147" }))).status,
    ).toBe(200);
    expect(mocks.saveProfile).toHaveBeenCalledWith(user, { firstName: "A", lastName: "B", phone: "(805) 555-0147" });
  });
  it.each([
    { firstName: "", lastName: "B", phone: "" },
    { firstName: "A", lastName: "B", phone: "invalid" },
    { firstName: "A".repeat(81), lastName: "B", phone: "" },
  ])("rejects malformed profile values", async (body) => {
    expect((await profilePut(request("PUT", body))).status).toBe(400);
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });
  it("validates preferences and rejects arbitrary fields", async () => {
    expect((await preferencesPut(request("PUT", { timeFormat: "invalid", defaultClassCategory: "All" }))).status).toBe(
      400,
    );
    expect(mocks.savePreferences).not.toHaveBeenCalled();
    mocks.savePreferences.mockResolvedValue({ preferences: { timeFormat: "24h", defaultClassCategory: "Cardio" } });
    expect((await preferencesPut(request("PUT", { timeFormat: "24h", defaultClassCategory: "Cardio" }))).status).toBe(
      200,
    );
    expect(mocks.savePreferences).toHaveBeenCalledWith(user, { timeFormat: "24h", defaultClassCategory: "Cardio" });
  });
  it("binds booking and cancellation to the verified owner and dated class", async () => {
    mocks.reserve.mockResolvedValue([]);
    mocks.cancel.mockResolvedValue([]);
    const body = { classId: "0123456789abcdef01234567", date: "2026-10-11" };
    await reservationsPost(request("POST", body));
    await reservationsDelete(request("DELETE", body));
    expect(mocks.reserve).toHaveBeenCalledWith(user.id, body.classId, body.date);
    expect(mocks.cancel).toHaveBeenCalledWith(user.id, body.classId, body.date);
  });
  it("rejects checkout price and card data instead of trusting or saving it", async () => {
    const response = await checkoutPost(
      request("POST", {
        plan: "Premium",
        idempotencyKey: "b919d1d6-0c2d-435a-8a8e-d8a06d66f311",
        amountCents: 1,
        cardNumber: "test-only",
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.demoCheckout).not.toHaveBeenCalled();
  });
  it("passes only the verified identity and valid plan to checkout", async () => {
    mocks.demoCheckout.mockResolvedValue({ orders: [] });
    const key = "b919d1d6-0c2d-435a-8a8e-d8a06d66f311";
    expect((await checkoutPost(request("POST", { plan: "Premium", idempotencyKey: key }))).status).toBe(200);
    expect(mocks.demoCheckout).toHaveBeenCalledWith(user.id, user.email, "Premium", key);
  });
  it("rejects cross-origin mutation requests", async () => {
    expect((await profilePut(request("PUT", {}, "https://other.example"))).status).toBe(403);
    expect(mocks.saveProfile).not.toHaveBeenCalled();
  });
  it("reports authentication outages without querying MongoDB", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthRetryableFetchError("private details", 503),
    });
    const response = await profileGet(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private details");
    expect(mocks.loadProfile).not.toHaveBeenCalled();
  });
  it("does not leak database failure details", async () => {
    mocks.loadProfile.mockRejectedValue(new Error("private URI"));
    const response = await profileGet(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private URI");
  });
});
