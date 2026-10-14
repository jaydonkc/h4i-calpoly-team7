import { afterEach, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import FitnessClassModel from "@/database/userSchema";
import sampleSchedule from "@/data/classes.json";
import { seedClasses } from "@/lib/classes/seed-classes";

afterEach(() => vi.unstubAllEnvs());

it.each(["production", "test", undefined])("rejects environment %s without writing", async (environment) => {
  vi.stubEnv("NODE_ENV", environment);
  const update = vi.spyOn(FitnessClassModel, "updateOne");
  await expect(seedClasses()).rejects.toThrow("only allowed in development");
  expect(update).not.toHaveBeenCalled();
});

it("seeds every day of the gym's current week and reuses IDs on reruns", async () => {
  vi.stubEnv("NODE_ENV", "development");
  const stored = new Map<string, Record<string, unknown>>();
  const update = vi.spyOn(FitnessClassModel, "updateOne").mockImplementation((filter, changes) => {
    const { date, title } = filter as { date: string; title: string };
    const { $setOnInsert } = changes as { $setOnInsert: Record<string, unknown> & { _id: Types.ObjectId } };
    if (!Array.from(stored.values()).some((record) => record.date === date && record.title === title))
      stored.set($setOnInsert._id.toString(), $setOnInsert);
    return Promise.resolve({ acknowledged: true }) as unknown as ReturnType<typeof FitnessClassModel.updateOne>;
  });

  expect(await seedClasses(new Date("2026-10-07T12:00:00-07:00"))).toBe(sampleSchedule.classes.length * 7);
  const firstIds = Array.from(stored.keys());
  // A staff member's capacity edit must survive an idempotent reseed.
  stored.get(firstIds[0])!.spots = 3;
  await seedClasses(new Date("2026-10-09T01:00:00Z"));
  expect(stored.get(firstIds[0])!.spots).toBe(3);

  expect(stored.size).toBe(sampleSchedule.classes.length * 7);
  expect(Array.from(stored.keys())).toEqual(firstIds);
  expect(update).toHaveBeenCalledTimes(sampleSchedule.classes.length * 14);
  expect(Array.from(new Set(Array.from(stored.values(), (fields) => fields.date))).sort()).toEqual([
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
    "2026-10-09",
    "2026-10-10",
    "2026-10-11",
  ]);
  for (const fields of Array.from(stored.values())) {
    expect(fields).not.toHaveProperty("id");
    expect(fields).not.toHaveProperty("color");
    expect(new FitnessClassModel(fields).validateSync()).toBeUndefined();
  }
  expect(update.mock.calls[0][2]).toEqual({ upsert: true, runValidators: true });

  await seedClasses(new Date("2026-11-02T00:00:00Z"));
  // It is still Sunday in California, so use the week ending November 1.
  expect(stored.size).toBe(sampleSchedule.classes.length * 14);
  expect(Array.from(stored.keys()).slice(0, firstIds.length)).toEqual(firstIds);
  expect(
    Array.from(
      new Set(
        Array.from(stored.values())
          .slice(firstIds.length)
          .map((fields) => fields.date),
      ),
    ).sort(),
  ).toEqual(["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01"]);
});
