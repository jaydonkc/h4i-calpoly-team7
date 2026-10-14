import { AuthRetryableFetchError } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/profile/page";
import ProfileClient from "@/app/profile/ProfileClient";
import SessionUnavailable from "@/app/profile/SessionUnavailable";
import { classReturnPath, loginPath, safeNextPath } from "@/lib/auth/redirect";
import { signInErrorMessage } from "@/lib/auth/errors";
const mock = vi.hoisted(() => ({ getUser: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: () => ({ auth: { getUser: mock.getUser } }) }));
vi.mock("next/navigation", () => ({ redirect: mock.redirect, useRouter: vi.fn() }));
beforeEach(() => {
  vi.resetAllMocks();
  mock.redirect.mockImplementation(() => {
    throw new Error("redirect");
  });
});
describe("server account page protection", () => {
  it("redirects a signed-out request to login with the intended class", async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const next = classReturnPath("abc123", "2026-10-12");
    await expect(ProfilePage({ searchParams: { next } })).rejects.toThrow("redirect");
    expect(mock.redirect).toHaveBeenCalledWith(loginPath(next));
  });
  it("rejects repeated next values and ignores repeated auth errors", async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(
      ProfilePage({ searchParams: { next: ["/classes", "/purchase"], authError: ["a", "b"] } }),
    ).rejects.toThrow("redirect");
    expect(mock.redirect).toHaveBeenCalledWith("/login?next=%2Fprofile");
  });
  it("rejects an unverified user supplied with an auth error", async () => {
    mock.getUser.mockResolvedValue({ data: { user: { id: "forged" } }, error: { status: 401 } });
    await expect(ProfilePage({ searchParams: {} })).rejects.toThrow("redirect");
    expect(mock.redirect).toHaveBeenCalledWith("/login?next=%2Fprofile");
  });
  it("renders account controls only after server verification", async () => {
    mock.getUser.mockResolvedValue({ data: { user: { id: "verified" } }, error: null });
    expect((await ProfilePage({ searchParams: {} })).type).toBe(ProfileClient);
    expect(mock.redirect).not.toHaveBeenCalled();
  });
  it("shows a recoverable outage without rendering account controls", async () => {
    mock.getUser.mockResolvedValue({ data: { user: null }, error: new AuthRetryableFetchError("private detail", 503) });
    expect((await ProfilePage({ searchParams: {} })).type).toBe(SessionUnavailable);
    expect(mock.redirect).not.toHaveBeenCalled();
  });
  it("handles a rejected authentication request as an outage", async () => {
    mock.getUser.mockRejectedValue(new Error("private detail"));
    expect((await ProfilePage({ searchParams: {} })).type).toBe(SessionUnavailable);
  });
});
describe("login return destinations and errors", () => {
  it("preserves the class date and selection without booking it", () => {
    const path = classReturnPath("abc123", "2026-10-12");
    expect(path).toBe("/classes?day=2026-10-12&class=abc123#class-abc123-2026-10-12");
    expect(new URL(loginPath(path), "https://gym.example").searchParams.get("next")).toBe(path);
  });
  it.each(["https://evil.example", "//evil.example", "/login?next=/login", "/auth/callback?code=x"])(
    "prevents unsafe or looping return destination %s",
    (path) => {
      expect(safeNextPath(path)).toBe("/profile");
    },
  );
  it.each([
    [{ code: "invalid_credentials", status: 400 }, "Incorrect email or password. Please try again."],
    [{ code: "email_not_confirmed", status: 400 }, "Confirm your email before logging in."],
    [{ status: 429 }, "Too many login attempts. Please wait a moment and try again."],
    [new TypeError("private network detail"), "Unable to log in right now. Check your connection and try again."],
  ])("shows a clear safe error for %j", (error, message) => {
    expect(signInErrorMessage(error)).toBe(message);
  });
});
