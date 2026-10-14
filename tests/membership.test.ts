import { AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/membership/route";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), ensureDemoMembership: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock("@/lib/memberships/repository", () => ({ ensureDemoMembership: mocks.ensureDemoMembership }));
beforeEach(() => vi.resetAllMocks());

describe("membership privacy", () => {
  it("rejects signed-out users before querying MongoDB", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await GET()).status).toBe(401);
    expect(mocks.ensureDemoMembership).not.toHaveBeenCalled();
  });
  it("queries only the verified identity, without a user-supplied ID", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "verified-user", email: "demo@example.com" } },
      error: null,
    });
    mocks.ensureDemoMembership.mockResolvedValue({ plan: "Standard", source: "manual_demo" });
    const response = await GET();
    expect(mocks.ensureDemoMembership).toHaveBeenCalledWith("verified-user", "demo@example.com");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await response.json()).toEqual({ membership: { plan: "Standard", source: "manual_demo" } });
  });
  it("returns the default Basic membership for a demo account", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    mocks.ensureDemoMembership.mockResolvedValue({ plan: "Basic", status: "active", source: "default_demo" });
    expect(await (await GET()).json()).toEqual({
      membership: { plan: "Basic", status: "active", source: "default_demo" },
    });
  });
  it("distinguishes database failure from no membership", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user" } }, error: null });
    mocks.ensureDemoMembership.mockRejectedValue(new Error("secret internal error"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("secret internal error");
  });
  it("reports resolved authentication outages as unavailable", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new AuthRetryableFetchError("private detail", 503),
    });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private detail");
    expect(mocks.ensureDemoMembership).not.toHaveBeenCalled();
  });
});
