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

it("reuses seed IDs on reruns and writes valid examples with today's date", async () => {
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
  for (const fields of Array.from(stored.values())) {
    expect(fields.date).toBe("2026-10-08");
    expect(fields).not.toHaveProperty("id");
    expect(fields).not.toHaveProperty("color");
    expect(new FitnessClassModel(fields).validateSync()).toBeUndefined();
  }
  expect(update.mock.calls[0][2]).toEqual({ upsert: true, runValidators: true });
});
