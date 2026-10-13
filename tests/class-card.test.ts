import { beforeEach, expect, it, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
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
  useState: (value: unknown) => [value, vi.fn()],
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
beforeEach(() => {
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
