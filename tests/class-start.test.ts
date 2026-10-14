import { describe, expect, it } from "vitest";
import { getClassStatus, hasClassStarted } from "@/lib/classes/class-start";
describe("Los Angeles class start checks", () => {
  const now = new Date("2026-10-11T10:00:00-07:00");
  it.each(["6:00", "7:30", "9:00", "09:00", "10:00"])("rejects started class %s regardless of padding", (time) =>
    expect(hasClassStarted("2026-10-11", time, now)).toBe(true),
  );
  it.each(["10:01", "17:30", "23:59"])("allows upcoming class %s", (time) =>
    expect(hasClassStarted("2026-10-11", time, now)).toBe(false),
  );
  it("compares calendar dates in gym time across UTC midnight", () => {
    const evening = new Date("2026-10-12T01:00:00Z");
    expect(hasClassStarted("2026-10-11", "19:00", evening)).toBe(false);
    expect(hasClassStarted("2026-10-10", "23:59", evening)).toBe(true);
    expect(hasClassStarted("2026-10-12", "0:00", evening)).toBe(false);
  });
});

describe("class display status", () => {
  it.each([
    ["2026-10-11T09:59:59-07:00", "Upcoming"],
    ["2026-10-11T10:00:00-07:00", "In progress"],
    ["2026-10-11T10:59:59-07:00", "In progress"],
    ["2026-10-11T11:00:00-07:00", "Completed"],
    ["2026-10-12T00:00:00-07:00", "Completed"],
  ])("shows %s as %s", (now, expected) => {
    expect(getClassStatus("2026-10-11", "10:00", "11:00", new Date(now))).toBe(expected);
  });
  it("uses the gym date when UTC has moved to the next day", () => {
    expect(getClassStatus("2026-10-11", "18:00", "19:00", new Date("2026-10-12T01:30:00Z"))).toBe("In progress");
  });
});
