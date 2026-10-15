// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ClassesPage from "@/app/classes/classes";
import { AccountRequestError } from "@/lib/account/request-error";
import type { ClassSchedule, FitnessClass } from "@/types/fitness-class";

const mocks = vi.hoisted(() => ({ reserve: vi.fn(), cancel: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    isUserSignedIn: true,
    isLoading: false,
    profileLoading: false,
    reservedClasses: [],
    reserveClass: mocks.reserve,
    cancelReservation: mocks.cancel,
    preferences: { timeFormat: "12h", defaultClassCategory: "All" },
  }),
}));

const fitnessClass: FitnessClass = {
  id: "demo",
  date: "2099-10-14",
  title: "Evening Yoga",
  category: "Mind & Body",
  time: "18:00",
  end: "19:00",
  coach: "Alex",
  room: "Studio",
  level: "Beginner",
  duration: "60 min",
  spots: 1,
  description: "Stretch and relax",
};
const schedule: ClassSchedule = {
  weekLabel: "Test week",
  days: [{ label: "WED", date: fitnessClass.date }],
  classes: [fitnessClass],
};

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

it.each([
  [409, "This class is full."],
  [409, "This class has already started."],
  [409, "This class has changed. Refresh the schedule and try again."],
  [404, "This class is no longer on the schedule."],
])("refreshes availability and explains a rejected booking (%s, %s)", async (status, message) => {
  mocks.reserve.mockRejectedValueOnce(new AccountRequestError(message, status));
  const refresh = vi.fn();
  render(<ClassesPage initialSchedule={schedule} onRefresh={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
  await waitFor(() => expect(refresh).toHaveBeenCalledExactlyOnceWith());
  expect(screen.getByRole("alert").textContent).toContain(message);
  expect(screen.getByRole("alert").textContent).toContain("Your booking was not completed.");
  expect(mocks.reserve).toHaveBeenCalledTimes(1);
  expect(screen.queryByText(/You're booked/)).toBeNull();
});

it("shows full availability after refresh and preserves the notice when a class is removed", async () => {
  mocks.reserve.mockRejectedValueOnce(new AccountRequestError("This class is full.", 409));
  const refresh = vi.fn();
  const view = render(<ClassesPage initialSchedule={schedule} onRefresh={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
  await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
  view.rerender(
    <ClassesPage initialSchedule={{ ...schedule, classes: [{ ...fitnessClass, spots: 0 }] }} onRefresh={refresh} />,
  );
  expect((screen.getByRole("button", { name: "Full" }) as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<ClassesPage initialSchedule={{ ...schedule, classes: [] }} onRefresh={refresh} />);
  expect(screen.getByRole("alert").textContent).toContain("This class is full.");
  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  expect(screen.queryByRole("alert")).toBeNull();
});

it("keeps ordinary failures on the card without claiming a rejected booking or retrying it", async () => {
  mocks.reserve.mockRejectedValueOnce(new AccountRequestError("Service temporarily unavailable.", 503));
  const refresh = vi.fn();
  render(<ClassesPage initialSchedule={schedule} onRefresh={refresh} />);
  fireEvent.click(screen.getByRole("button", { name: "Reserve" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Service temporarily unavailable."));
  expect(refresh).not.toHaveBeenCalled();
  expect(mocks.reserve).toHaveBeenCalledTimes(1);
});
