import { afterEach, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ClassesPage from "@/app/classes/classes";
import type { ClassSchedule, FitnessClass } from "@/types/fitness-class";

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    preferences: { timeFormat: "12h", defaultClassCategory: "All" },
    profileLoading: false,
    isLoading: false,
  }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("@/components/classes/ClassCard", () => ({
  default: ({ fitnessClass }: { fitnessClass: FitnessClass }) => createElement("div", null, fitnessClass.title),
}));
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

function scheduleFor(dates: string[], today: string): ClassSchedule {
  return {
    weekLabel: "October 26—November 1, 2026",
    days: dates.map((date, index) => ({
      date,
      label: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][index],
      ...(date === today ? { isToday: true } : {}),
    })),
    classes: [],
  };
}
const week = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"];

it("renders only the returned week and valid day numbers across a month boundary", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-30T12:00:00-07:00"));
  const html = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: scheduleFor(week, "2026-10-30") }));
  expect(html.match(/role="tab"/g)).toHaveLength(7);
  expect(html).toContain("October 26—November 1, 2026");
  expect(html).toContain("<strong>1</strong>");
  expect(html).not.toContain("<strong>32</strong>");
  expect(html).not.toContain("<strong>36</strong>");
});

it.each(["UTC", "America/Los_Angeles", "Asia/Tokyo"])("uses the API's gym day on a %s server", (timezone) => {
  vi.stubEnv("TZ", timezone);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-11T01:00:00Z"));
  const schedule = scheduleFor(["2026-10-10", "2026-10-11"], "2026-10-10");
  const base = {
    id: "today",
    title: "California evening class",
    category: "Cardio" as const,
    date: "2026-10-10",
    time: "19:00",
    end: "20:00",
    coach: "Alex",
    room: "Studio",
    level: "Beginner",
    duration: "60 min",
    spots: 10,
    description: "Example",
  };
  schedule.classes = [base, { ...base, id: "other-month", date: "2026-11-10", title: "Other month class" }];
  const html = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: schedule }));
  expect(html).toContain("California evening class");
  expect(html).not.toContain("Other month class");
  expect(html).toContain("1 class");
});

it("does not add next-week tabs when today is Sunday", () => {
  const html = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: scheduleFor(week, "2026-11-01") }));
  expect(html.match(/role="tab"/g)).toHaveLength(7);
  expect(html).not.toContain("<strong>2</strong>");
});

it("places started classes after upcoming classes", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-30T12:00:00-07:00"));
  const schedule = scheduleFor(week, "2026-10-30");
  const base = {
    category: "Cardio" as const,
    date: "2026-10-30",
    coach: "Alex",
    room: "Studio",
    level: "Beginner",
    duration: "60 min",
    spots: 10,
    description: "Example",
  };
  schedule.classes = [
    { ...base, id: "started", title: "Started class", time: "09:00", end: "10:00" },
    { ...base, id: "upcoming", title: "Upcoming class", time: "13:00", end: "14:00" },
  ];

  const html = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: schedule }));

  expect(html.indexOf("Upcoming class")).toBeLessThan(html.indexOf("Started class"));
});

it("keeps loading, empty and error states distinct", () => {
  const schedule = scheduleFor(week, "2026-10-30");
  const empty = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: schedule }));
  const loading = renderToStaticMarkup(
    createElement(ClassesPage, { initialSchedule: schedule, errorMessage: "loading" }),
  );
  const error = renderToStaticMarkup(
    createElement(ClassesPage, { initialSchedule: schedule, errorMessage: "Unavailable" }),
  );
  expect(empty).toContain("Rest day, for now.");
  expect(loading).toContain('role="status"');
  expect(loading).toContain("Loading class schedule…");
  expect(loading).toContain('aria-busy="true"');
  expect(loading).not.toContain("Rest day, for now.");
  expect(error).toContain('role="alert"');
  expect(error).toContain("Reload");
  expect(error).not.toContain("Rest day, for now.");
});

it("places completed classes last while retaining time order in both groups", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-30T12:00:00-07:00"));
  const schedule = scheduleFor(week, "2026-10-30");
  const base: FitnessClass = {
    id: "early",
    date: "2026-10-30",
    title: "Early completed class",
    category: "Cardio",
    time: "08:00",
    end: "09:00",
    coach: "Alex",
    room: "Studio",
    level: "Beginner",
    duration: "60 min",
    spots: 10,
    description: "Example",
  };
  schedule.classes = [
    base,
    { ...base, id: "just-ended", title: "Just completed class", time: "11:00", end: "12:00" },
    { ...base, id: "ongoing", title: "Ongoing class", time: "11:30", end: "12:30" },
    { ...base, id: "afternoon", title: "Afternoon class", time: "13:00", end: "14:00" },
    { ...base, id: "evening", title: "Evening class", time: "18:00", end: "19:00" },
  ];
  const html = renderToStaticMarkup(createElement(ClassesPage, { initialSchedule: schedule }));
  const expected = [
    "Ongoing class",
    "Afternoon class",
    "Evening class",
    "Early completed class",
    "Just completed class",
  ];
  for (let i = 1; i < expected.length; i++) {
    expect(html.indexOf(expected[i - 1])).toBeLessThan(html.indexOf(expected[i]));
  }
});
