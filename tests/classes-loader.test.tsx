// @vitest-environment jsdom

import { screen, fireEvent, render, waitFor, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ClassesLoader from "@/app/classes/ClassesLoader";

type MockClassesPageProps = {
  initialSchedule: {
    weekLabel: string;
    days: unknown[];
    classes: unknown[];
  };
  errorMessage: string | null;
  onRetry: () => void;
};

const mocks = vi.hoisted(() => ({
  classesPage: vi.fn(),
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    reservationsRevision: 0,
  }),
}));

vi.mock("@/app/classes/classes", () => ({
  default: (props: MockClassesPageProps) => {
    mocks.classesPage(props);

    return (
      <button type="button" onClick={props.onRetry}>
        Retry
      </button>
    );
  },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function latestProps() {
  return mocks.classesPage.mock.calls.at(-1)?.[0];
}

it("loads and passes the schedule to ClassesPage", async () => {
  const schedule = {
    weekLabel: "October 12–18, 2026",
    days: [
      {
        label: "MON",
        date: "2026-10-12",
        isToday: true,
      },
    ],
    classes: [],
  };

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: schedule,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    ),
  );

  render(<ClassesLoader />);

  // Initial render
  expect(latestProps().errorMessage).toBe("loading");

  // Render after fetch finishes
  await waitFor(() => {
    expect(latestProps().initialSchedule).toEqual(schedule);
    expect(latestProps().errorMessage).toBeNull();
  });

  expect(fetch).toHaveBeenCalledWith(
    "/api/classes",
    expect.objectContaining({
      cache: "no-store",
      signal: expect.any(AbortSignal),
    }),
  );
});

it("passes an error message to ClassesPage when loading fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(null, {
        status: 503,
      }),
    ),
  );

  render(<ClassesLoader />);

  await waitFor(() => {
    expect(latestProps().errorMessage).toBe("The class schedule is temporarily unavailable. Please try again.");
  });

  expect(latestProps().initialSchedule).toEqual({
    weekLabel: "",
    days: [],
    classes: [],
  });

  expect(fetch).toHaveBeenCalledTimes(1);
});

it("successfully load schedule after one retry", async () => {
  const schedule = {
    weekLabel: "October 12–18, 2026",
    days: [
      {
        label: "MON",
        date: "2026-10-12",
        isToday: true,
      },
    ],
    classes: [],
  };
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 503,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            success: true,
            data: schedule,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
  );

  render(<ClassesLoader />);

  await waitFor(() => {
    expect(latestProps().errorMessage).toContain("temporarily unavailable");
  });

  expect(fetch).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole("button", { name: "Retry" }));

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(latestProps().initialSchedule).toEqual(schedule);
    expect(latestProps().errorMessage).toBeNull();
  });
});
