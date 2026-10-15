// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ClassesPage from "@/app/classes/classes";
import type { ClassSchedule, FitnessClass } from "@/types/fitness-class";

const account = vi.hoisted(() => ({ defaultClassCategory: "All" }));
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    preferences: { defaultClassCategory: account.defaultClassCategory },
    profileLoading: false,
    isLoading: false,
  }),
}));
vi.mock("@/components/classes/ClassCard", () => ({
  default: ({ fitnessClass }: { fitnessClass: FitnessClass }) => <div>{fitnessClass.title}</div>,
}));
vi.mock("@/components/classes/BookingNotice", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  account.defaultClassCategory = "All";
});

const base: FitnessClass = {
  id: "yoga",
  date: "2026-10-14",
  title: "Morning Yoga",
  category: "Mind & Body",
  time: "09:00",
  end: "10:00",
  coach: "Alex",
  room: "Studio A",
  location: "Downtown",
  level: "Beginner",
  duration: "60 min",
  spots: 10,
  description: "Stretch and relax",
};
const schedule: ClassSchedule = {
  weekLabel: "October 12–18, 2026",
  days: [
    { label: "WED", date: "2026-10-14", isToday: true },
    { label: "THU", date: "2026-10-15" },
    { label: "FRI", date: "2026-10-16" },
  ],
  classes: [
    base,
    { ...base, id: "strength", title: "Strength Basics", category: "Strength" },
    { ...base, id: "tomorrow", title: "Thursday Yoga", date: "2026-10-15" },
  ],
};

function chooseFilter(label: string, option: string) {
  fireEvent.click(screen.getByText(label, { selector: "summary > span" }));
  fireEvent.click(screen.getByRole("checkbox", { name: new RegExp(option) }));
}

it("immediately resets all applied and draft filters and closes the dropdown", () => {
  render(<ClassesPage initialSchedule={schedule} />);
  chooseFilter("Class types", "Strength");
  chooseFilter("Duration", "60 min");
  chooseFilter("Difficulty", "Beginner");
  chooseFilter("Instructor", "Alex");
  chooseFilter("Location", "Downtown");
  fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));
  expect(screen.queryByText("Morning Yoga")).toBeNull();
  chooseFilter("Class types", "Cardio");
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.getByText("Morning Yoga")).toBeTruthy();
  expect(screen.getByText("Strength Basics")).toBeTruthy();
  expect(screen.queryByRole("checkbox")).toBeNull();
  for (const label of ["Class types", "Duration", "Difficulty", "Instructor", "Location"]) {
    const trigger = screen.getByText(label, { selector: "summary > span" }).closest("summary")!;
    expect(trigger.querySelector("b")).toBeNull();
  }
  fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));
  expect(screen.getByText("Morning Yoga")).toBeTruthy();
});

it("offers a reset for filtered results and keeps the selected day", () => {
  render(<ClassesPage initialSchedule={schedule} />);
  fireEvent.click(screen.getByRole("tab", { name: /THU/ }));
  chooseFilter("Class types", "Strength");
  fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));
  const empty = screen.getByRole("heading", { name: "No classes match your filters." }).parentElement!;
  fireEvent.click(within(empty).getByRole("button", { name: "Reset filters" }));
  expect(screen.getByText("Thursday Yoga")).toBeTruthy();
  expect(screen.queryByText("Morning Yoga")).toBeNull();
});

it("distinguishes an unscheduled day from filtered-out classes", () => {
  render(<ClassesPage initialSchedule={schedule} />);
  fireEvent.click(screen.getByRole("tab", { name: /FRI/ }));
  expect(screen.getByText("There are no classes scheduled on this day. Try another day.")).toBeTruthy();
  expect(screen.queryByText("No classes match your filters.")).toBeNull();
});

it("clears a saved default category without changing the account preference", () => {
  account.defaultClassCategory = "Strength";
  render(<ClassesPage initialSchedule={schedule} />);
  expect(screen.queryByText("Morning Yoga")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));
  expect(screen.getByText("Morning Yoga")).toBeTruthy();
  expect(account.defaultClassCategory).toBe("Strength");
});
