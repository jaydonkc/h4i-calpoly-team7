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
    const { _id } = filter as { _id: Types.ObjectId };
    const { $set } = changes as { $set: Record<string, unknown> };
    stored.set(_id.toString(), $set);
    return Promise.resolve({ acknowledged: true }) as unknown as ReturnType<typeof FitnessClassModel.updateOne>;
  });

  expect(await seedClasses(new Date("2026-10-07T12:00:00-07:00"))).toBe(sampleSchedule.classes.length);
  const firstIds = Array.from(stored.keys());
  await seedClasses(new Date("2026-10-09T01:00:00Z"));

  expect(stored.size).toBe(sampleSchedule.classes.length);
  expect(Array.from(stored.keys())).toEqual(firstIds);
  expect(update).toHaveBeenCalledTimes(sampleSchedule.classes.length * 2);
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
  expect(stored.size).toBe(sampleSchedule.classes.length);
  expect(Array.from(stored.keys())).toEqual(firstIds);
  expect(Array.from(new Set(Array.from(stored.values(), (fields) => fields.date))).sort()).toEqual([
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
  ]);
});
