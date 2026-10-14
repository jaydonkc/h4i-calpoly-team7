import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ClassCard from "@/components/classes/ClassCard";
import type { FitnessClass } from "@/types/fitness-class";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    isUserSignedIn: false,
    isLoading: false,
    reservedClasses: [],
    preferences: { timeFormat: "12h" },
  }),
}));
const fitnessClass: FitnessClass = {
  id: "demo",
  date: "2026-10-14",
  title: "Demo Class",
  category: "Cardio",
  time: "18:00",
  end: "19:00",
  coach: "Instructor",
  room: "Studio",
  level: "Beginner",
  duration: "60 min",
  spots: 10,
  description: "Demo",
};
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
it.each([
  ["2026-10-14T18:00:00-07:00", "In progress"],
  ["2026-10-14T19:00:00-07:00", "Completed"],
  ["2026-10-15T12:00:00-07:00", "Completed"],
])("renders the class status at %s", (now, status) => {
  vi.setSystemTime(new Date(now));
  const html = renderToStaticMarkup(createElement(ClassCard, { fitnessClass }));
  expect(html).toContain(`aria-label="${status}: Demo Class"`);
  expect(html).toContain(`>${status}</button>`);
  expect(html).toContain('disabled=""');
});
it("keeps upcoming classes available", () => {
  vi.setSystemTime(new Date("2026-10-14T17:59:59-07:00"));
  const html = renderToStaticMarkup(createElement(ClassCard, { fitnessClass }));
  expect(html).toContain(">Log in to reserve</button>");
  expect(html).not.toContain('disabled=""');
});
