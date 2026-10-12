import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
const mock = vi.hoisted(() => ({ createServerClient: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: mock.createServerClient }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://auth.example");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-public-key");
});
it("verifies the session and copies every refreshed cookie to the browser response", async () => {
  const getUser = vi.fn();
  mock.createServerClient.mockImplementation((_url, _key, options) => {
    getUser.mockImplementation(async () => {
      expect(options.cookies.getAll()).toEqual([{ name: "existing", value: "test-only" }]);
      options.cookies.setAll([
        { name: "session", value: "refreshed-test-only", options: { httpOnly: true, path: "/" } },
      ]);
      return { data: { user: { id: "verified" } }, error: null };
    });
    return { auth: { getUser } };
  });
  const request = new NextRequest("https://gym.example/classes", { headers: { cookie: "existing=test-only" } });
  const response = await middleware(request);
  expect(getUser).toHaveBeenCalledOnce();
  expect(request.cookies.get("session")?.value).toBe("refreshed-test-only");
  expect(response.cookies.get("session")?.value).toBe("refreshed-test-only");
  expect(response.cookies.get("session")?.httpOnly).toBe(true);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
it("keeps public routes available during provider failure while protected handlers independently verify", async () => {
  mock.createServerClient.mockReturnValue({ auth: { getUser: vi.fn().mockRejectedValue(new Error("unavailable")) } });
  expect((await middleware(new NextRequest("https://gym.example/classes"))).status).toBe(200);
});
