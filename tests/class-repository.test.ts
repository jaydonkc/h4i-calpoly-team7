import { afterEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";
import connectDB from "@/database/db";
import FitnessClassModel from "@/database/userSchema";
import { classRepository } from "@/lib/classes/class-repository";
import { classCategories } from "@/types/fitness-class";

vi.mock("@/database/db", () => ({ default: vi.fn() }));

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("fitness class schema", () => {
  const validClass = {
    date: "2026-10-06",
    title: "Morning Cardio",
    category: "Cardio",
    time: "9:00 AM",
    end: "10:00 AM",
    coach: "Alex",
    room: "Studio 1",
    level: "Beginner",
    duration: "60 minutes",
    spots: 10,
    description: "A cardio class for beginners.",
  };

  it.each(classCategories)("generates an ObjectId and accepts scalar category %s", (category) => {
    const record = new FitnessClassModel({ ...validClass, category });
    expect(record._id).toBeInstanceOf(Types.ObjectId);
    expect(record.category).toBe(category);
    expect(record.validateSync()).toBeUndefined();
  });

  it.each([undefined, "Unknown", ["Cardio"]])("rejects invalid category %j", (category) => {
    const error = new FitnessClassModel({ ...validClass, category }).validateSync();
    expect(error?.errors.category).toBeDefined();
  });

  it.each(Object.keys(validClass))("requires %s", (field) => {
    const error = new FitnessClassModel({ ...validClass, [field]: undefined }).validateSync();
    expect(error?.errors[field]).toBeDefined();
  });

  it.each([-1, 1.5, NaN, Infinity])("rejects invalid spots %s", (spots) => {
    const error = new FitnessClassModel({ ...validClass, spots }).validateSync();
    expect(error?.errors.spots).toBeDefined();
  });

  it.each([0, 1, 10])("accepts nonnegative integer spots %s", (spots) => {
    expect(new FitnessClassModel({ ...validClass, spots }).validateSync()).toBeUndefined();
  });
});

describe("class repository", () => {
  it("excludes legacy records with non-string times before sorting", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 6, 12));
    const base = { _id: new Types.ObjectId(), date: "2026-10-06", category: "Cardio" };
    const records = [
      { ...base, time: "1:00 PM" },
      { ...base, time: undefined },
      { ...base, time: null },
      { ...base, time: 900 },
      { ...base, time: "9:00 AM" },
    ];
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(records),
    };
    vi.spyOn(FitnessClassModel, "find").mockReturnValue(query as unknown as ReturnType<typeof FitnessClassModel.find>);

    const schedule = await classRepository.getSchedule();

    expect(schedule.classes.map((record) => record.time)).toEqual(["9:00 AM", "1:00 PM"]);
  });

  it("looks up a generated ID using _id and preserves result conversion", async () => {
    const id = new Types.ObjectId().toString();
    const record = { _id: new Types.ObjectId(id), date: "2026-10-06", category: "Cardio", time: "9:00 AM" };
    const query = { lean: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue(record) };
    const findOne = vi
      .spyOn(FitnessClassModel, "findOne")
      .mockReturnValue(query as unknown as ReturnType<typeof FitnessClassModel.findOne>);

    const result = await classRepository.getById(id);

    expect(findOne).toHaveBeenCalledWith({ _id: id });
    expect(result).toMatchObject({ id, date: record.date, time: record.time });
    expect(result).not.toHaveProperty("color");
  });

  it("returns null when a valid ObjectId has no matching record", async () => {
    const query = { lean: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue(null) };
    vi.spyOn(FitnessClassModel, "findOne").mockReturnValue(
      query as unknown as ReturnType<typeof FitnessClassModel.findOne>,
    );

    await expect(classRepository.getById(new Types.ObjectId().toString())).resolves.toBeNull();
  });

  it.each([123, "123", "invalid"])("returns null for invalid ObjectId %j", async (id) => {
    await expect(classRepository.getById(id)).resolves.toBeNull();
    expect(connectDB).not.toHaveBeenCalled();
  });
});
