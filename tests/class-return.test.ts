import { beforeEach, expect, it, vi } from "vitest";
import ClassesPage from "@/app/classes/classes";
import type { ClassSchedule } from "@/types/fitness-class";

const hooks = vi.hoisted(() => ({
  refs: [] as Array<{ current: unknown }>,
  setters: [] as Array<ReturnType<typeof vi.fn>>,
  effects: [] as Array<() => void>,
  refIndex: 0,
  stateIndex: 0,
  profileLoading: true,
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useRef: (value: unknown) => (hooks.refs[hooks.refIndex++] ??= { current: value }),
  useState: (value: unknown) => [value, (hooks.setters[hooks.stateIndex++] ??= vi.fn())],
  useMemo: (compute: () => unknown) => compute(),
  useEffect: (effect: () => void) => hooks.effects.push(effect),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    preferences: { defaultClassCategory: "Strength" },
    profileLoading: hooks.profileLoading,
    isLoading: false,
    user: { id: "member" },
  }),
}));

beforeEach(() => {
  hooks.refs = [];
  hooks.setters = [];
  hooks.profileLoading = true;
  vi.stubGlobal("window", { location: { search: "?day=2026-10-14&class=selected" } });
});

function render(days: ClassSchedule["days"]) {
  hooks.refIndex = hooks.stateIndex = 0;
  hooks.effects = [];
  ClassesPage({ initialSchedule: { weekLabel: "This week", days, classes: [] } });
  hooks.effects.forEach((effect) => effect());
}

it("waits for the schedule and preferences, then restores the class return only once", () => {
  const days = [{ label: "Wed", date: "2026-10-14" }];
  render([]);
  render(days);
  expect(hooks.setters[0]).not.toHaveBeenCalled();
  hooks.profileLoading = false;
  render(days);
  expect(hooks.setters[0]).toHaveBeenCalledExactlyOnceWith("2026-10-14");
  // Saved preferences are applied first; the login return then reveals the selected class.
  expect(hooks.setters[5]).toHaveBeenLastCalledWith([]);
  const categoryCalls = hooks.setters[5].mock.calls.length;
  // A reservation/filter refresh must preserve the user's subsequent selection.
  render(days.map((day) => ({ ...day })));
  expect(hooks.setters[0]).toHaveBeenCalledTimes(1);
  expect(hooks.setters[5]).toHaveBeenCalledTimes(categoryCalls);
  vi.unstubAllGlobals();
});
