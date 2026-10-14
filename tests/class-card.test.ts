import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ClassCard from "@/components/classes/ClassCard";
import type { FitnessClass } from "@/types/fitness-class";

const mock = vi.hoisted(() => ({
  signedIn: true,
  reserve: vi.fn(),
  cancel: vi.fn(),
  push: vi.fn(),
  reservations: [] as FitnessClass[],
}));
vi.mock("react", async (original) => ({
  ...(await original<typeof import("react")>()),
  useState: (value: unknown) => [typeof value === "function" ? value() : value, vi.fn()],
  useRef: (value: unknown) => ({ current: value }),
  useEffect: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mock.push }) }));
vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    isUserSignedIn: mock.signedIn,
    reservedClasses: mock.reservations,
    reserveClass: mock.reserve,
    cancelReservation: mock.cancel,
    preferences: { timeFormat: "12h" },
  }),
}));
const fitnessClass: FitnessClass = {
  id: "class-id",
  date: "2026-10-14",
  title: "Demo Class",
  category: "Cardio",
  time: "18:00",
  end: "19:00",
  coach: "Jaydon Chen",
  room: "Studio",
  level: "Beginner",
  duration: "60 min",
  spots: 10,
  description: "Demo",
};
function action(node: ReactNode): () => Promise<void> {
  const element = node as ReactElement<{ children?: ReactNode; onClick?: () => Promise<void> }>;
  if (element?.type === "button" && element.props.onClick) return element.props.onClick;
  for (const child of [element?.props?.children].flat(Infinity)) {
    if (!child || typeof child !== "object") continue;
    try {
      return action(child);
    } catch {
      /* Search the next child. */
    }
  }
  throw new Error("Reservation button not found");
}
afterEach(() => vi.useRealTimers());
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-13T12:00:00-07:00"));
  vi.clearAllMocks();
  mock.signedIn = true;
  mock.reservations = [];
});
it("reports booking only after save confirmation and ignores duplicate clicks while pending", async () => {
  let resolve!: () => void;
  mock.reserve.mockImplementationOnce(
    () =>
      new Promise<void>((done) => {
        resolve = done;
      }),
  );
  const onBooked = vi.fn();
  const click = action(ClassCard({ fitnessClass, onBooked }));
  const pending = click();
  await click();
  expect(mock.reserve).toHaveBeenCalledTimes(1);
  expect(onBooked).not.toHaveBeenCalled();
  resolve();
  await pending;
  expect(onBooked).toHaveBeenCalledExactlyOnceWith(fitnessClass);
});
it("never reports successful booking after a failed save", async () => {
  mock.reserve.mockRejectedValueOnce(new Error("Unavailable"));
  const onBooked = vi.fn();
  await action(ClassCard({ fitnessClass, onBooked }))();
  expect(onBooked).not.toHaveBeenCalled();
});
it("cancels an existing reservation without showing a booking notice", async () => {
  mock.reservations = [fitnessClass];
  const onBooked = vi.fn();
  const onCanceled = vi.fn();
  await action(ClassCard({ fitnessClass, onBooked, onCanceled }))();
  expect(onCanceled).toHaveBeenCalledExactlyOnceWith(fitnessClass);
  expect(mock.cancel).toHaveBeenCalledExactlyOnceWith(fitnessClass);
  expect(onBooked).not.toHaveBeenCalled();
});
it("opens login with the selected class for signed-out visitors", async () => {
  mock.signedIn = false;
  await action(ClassCard({ fitnessClass }))();
  expect(mock.reserve).not.toHaveBeenCalled();
  expect(new URL(mock.push.mock.calls[0][0], "https://gym.example").searchParams.get("next")).toContain(
    "day=2026-10-14&class=class-id",
  );
});

it("does not reserve or send visitors to login for a class that has started", async () => {
  mock.signedIn = false;
  const past = { ...fitnessClass, date: "2000-01-01" };
  await action(ClassCard({ fitnessClass: past }))();
  expect(mock.reserve).not.toHaveBeenCalled();
  expect(mock.push).not.toHaveBeenCalled();
});
it.each([
  ["2026-10-14T18:00:00-07:00", "In progress"],
  ["2026-10-14T19:00:00-07:00", "Completed"],
  ["2026-10-15T12:00:00-07:00", "Completed"],
])("shows the class status at %s and blocks new bookings", async (now, status) => {
  vi.setSystemTime(new Date(now));
  mock.signedIn = false;
  const card = ClassCard({ fitnessClass });
  const html = renderToStaticMarkup(card);
  expect(html).toContain(`aria-label="${status}: Demo Class"`);
  expect(html).toContain(`>${status}</button>`);
  expect(html).toContain('disabled=""');
  await action(card)();
  expect(mock.reserve).not.toHaveBeenCalled();
  expect(mock.push).not.toHaveBeenCalled();
});
it("disables cancellation of an existing past reservation as in PR 49", async () => {
  const past = { ...fitnessClass, date: "2000-01-01" };
  mock.reservations = [past];
  await action(ClassCard({ fitnessClass: past }))();
  expect(mock.cancel).not.toHaveBeenCalled();
  expect(renderToStaticMarkup(ClassCard({ fitnessClass: past }))).toContain('aria-label="Completed: Demo Class"');
});
