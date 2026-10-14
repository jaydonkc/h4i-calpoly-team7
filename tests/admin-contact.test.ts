import { afterEach, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isGymAdmin } from "@/lib/admin/access";
import { validateMessage } from "@/lib/account/contact";
vi.mock("@/lib/auth/page-identity", () => ({ pageIdentity: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());
it("never trusts a member's editable metadata to grant administrator access", () => {
  vi.stubEnv("GYM_ADMIN_USER_IDS", "trusted-id");
  expect(isGymAdmin({ id: "ordinary-id", user_metadata: { role: "admin" }, app_metadata: {} } as unknown as User)).toBe(
    false,
  );
  expect(isGymAdmin({ id: "trusted-id", app_metadata: {} } as unknown as User)).toBe(true);
  expect(isGymAdmin({ id: "another-id", app_metadata: { role: "admin" } } as unknown as User)).toBe(true);
});
it("validates contact data before it reaches storage", () => {
  const message = {
    name: " Jaydon ",
    email: "jaydon@example.com",
    topic: "classes",
    message: " More morning classes, please. ",
  };
  expect(validateMessage(message).message).toBe("More morning classes, please.");
  expect(() => validateMessage({ ...message, userId: "someone-else" })).toThrow("Unexpected");
  expect(() => validateMessage({ ...message, topic: "admin" })).toThrow("listed topic");
  expect(() => validateMessage({ ...message, message: "a".repeat(3001) })).toThrow("3000");
});
