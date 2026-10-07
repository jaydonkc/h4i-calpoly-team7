import { afterEach, describe, expect, it, vi } from "vitest";
import { classRepository } from "@/lib/classes/class-repository";

afterEach(() => {
  vi.useRealTimers();
});

describe("class schedule week", () => {
  it("uses the current Monday through Sunday and advances without changing static data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-07T12:00:00-07:00"));

    const currentSchedule = await classRepository.getSchedule();

    expect(currentSchedule.weekLabel).toBe("October 5—11, 2026");
    expect(currentSchedule.days.map((day) => day.date)).toEqual([
      "2026-10-05",
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
    ]);
    expect(currentSchedule.days.find((day) => day.isToday)?.date).toBe("2026-10-07");
    expect(currentSchedule.classes[0].date).toBe("2026-10-05");

    vi.setSystemTime(new Date("2026-10-14T12:00:00-07:00"));

    const nextSchedule = await classRepository.getSchedule();

    expect(nextSchedule.weekLabel).toBe("October 12—18, 2026");
    expect(nextSchedule.days[0].date).toBe("2026-10-12");
    expect(nextSchedule.days.find((day) => day.isToday)?.date).toBe("2026-10-14");
    expect(nextSchedule.classes[0].date).toBe("2026-10-12");
  });
});
