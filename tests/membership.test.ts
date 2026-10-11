import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/membership/route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getMembership: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock("@/lib/memberships/repository", () => ({ getMembership: mocks.getMembership }));
beforeEach(() => vi.resetAllMocks());

describe("membership privacy", () => {
  it("rejects signed-out users before querying MongoDB", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await GET()).status).toBe(401);
    expect(mocks.getMembership).not.toHaveBeenCalled();
  });
  it("queries only the verified identity, without a user-supplied ID", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
    mocks.getMembership.mockResolvedValue({ plan: "Standard", source: "manual_demo" });
    const response = await GET();
    expect(mocks.getMembership).toHaveBeenCalledWith("verified-user");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ membership: { plan: "Standard", source: "manual_demo" } });
  });
  it("returns no membership for an account without one", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    mocks.getMembership.mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual({ membership: null });
  });
  it("distinguishes database failure from no membership", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    mocks.getMembership.mockRejectedValue(new Error("secret internal error"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret internal error");
  });
});
