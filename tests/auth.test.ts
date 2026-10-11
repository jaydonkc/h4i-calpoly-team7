import { AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/redirect";
import { GET as callback } from "@/app/auth/callback/route";
import { GET as currentUser } from "@/app/api/auth/user/route";

const auth = vi.hoisted(() => ({ getUser: vi.fn(), exchangeCodeForSession: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth }) }));

beforeEach(() => vi.resetAllMocks());

describe("authentication redirects", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\nevil.example",
    "/auth/callback?code=again",
    null,
  ])("rejects unsafe redirect %s", (path) => {
    expect(safeNextPath(path)).toBe("/profile");
  });
  it("preserves an internal return destination", () => {
    expect(safeNextPath("/classes?day=2026-10-11#schedule")).toBe("/classes?day=2026-10-11#schedule");
  });
  it("exchanges a code before redirecting to password recovery", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback(
      new NextRequest("https://gym.example/auth/callback?code=one-use-code&next=/auth/reset-password"),
    );
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("one-use-code");
    expect(response.headers.get("location")).toBe("https://gym.example/auth/reset-password");
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("uses the navigation cookie for an exact allow-listed callback URL", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const request = new NextRequest("https://gym.example/auth/callback?code=code", {
      headers: { cookie: "fm-auth-next=%2Fauth%2Freset-password" },
    });
    const response = await callback(request);
    expect(response.headers.get("location")).toBe("https://gym.example/auth/reset-password");
    expect(response.cookies.get("fm-auth-next")?.value).toBe("");
  });
  it("rejects an external destination stored in a cookie", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const request = new NextRequest("https://gym.example/auth/callback?code=code", {
      headers: { cookie: "fm-auth-next=https%3A%2F%2Fevil.example" },
    });
    expect((await callback(request)).headers.get("location")).toBe("https://gym.example/profile");
  });
  it("does not follow an external next parameter", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await callback(
      new NextRequest("https://gym.example/auth/callback?code=code&next=https://evil.example"),
    );
    expect(response.headers.get("location")).toBe("https://gym.example/profile");
  });
  it("returns a recoverable error for an expired code", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: new Error("expired") });
    const response = await callback(new NextRequest("https://gym.example/auth/callback?code=expired"));
    expect(response.headers.get("location")).toBe("https://gym.example/profile?authError=callback");
  });
  it("does not exchange a missing code", async () => {
    await callback(new NextRequest("https://gym.example/auth/callback"));
    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });
});

describe("protected user API", () => {
  it("rejects signed-out requests", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await currentUser()).status).toBe(401);
  });
  it("rejects an unverified identity even if a user is supplied", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "forged" } }, error: new Error("invalid token") });
    expect((await currentUser()).status).toBe(401);
  });
  it("returns only the verified user's public identity without caching", async () => {
    auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "member@example.com", user_metadata: { private: "hidden" } } },
      error: null,
    });
    const response = await currentUser();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(await response.json()).toEqual({ user: { id: "user-1", email: "member@example.com" } });
  });
  it("fails safely when authentication is unavailable", async () => {
    auth.getUser.mockRejectedValue(new Error("internal detail"));
    const response = await currentUser();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("internal detail");
  });
  it("reports resolved authentication outages as unavailable", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: new AuthRetryableFetchError("private detail", 503) });
    const response = await currentUser();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private detail");
  });
});
