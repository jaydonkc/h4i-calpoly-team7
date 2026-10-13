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
  vi.unstubAllEnvs();
});

describe("fitness class schema", () => {
  const validClass = {
    date: "2026-10-06",
    title: "Morning Cardio",
    category: "Cardio",
    time: "09:00",
    end: "10:00",
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

  it.each(["2026-02-31", "2026-04-31", "2025-02-29", "2100-02-29", "2026-13-01", "2026-2-01"])(
    "rejects impossible or malformed date %s",
    (date) => {
      expect(new FitnessClassModel({ ...validClass, date }).validateSync()?.errors.date).toBeDefined();
    },
  );

  it.each(["2024-02-29", "2030-01-01", "2000-02-29", "2026-12-31"])("accepts calendar date %s", (date) => {
    expect(new FitnessClassModel({ ...validClass, date }).validateSync()).toBeUndefined();
  });

  it.each(["24:00", "09:60", "8:00 AM"])("rejects invalid start and end time %s", (time) => {
    const error = new FitnessClassModel({ ...validClass, time, end: time }).validateSync();
    expect(error?.errors.time).toBeDefined();
    expect(error?.errors.end).toBeDefined();
  });

  it.each([0, 1, 10])("accepts nonnegative integer spots %s", (spots) => {
    expect(new FitnessClassModel({ ...validClass, spots }).validateSync()).toBeUndefined();
  });
});

describe("class repository", () => {
  it("excludes legacy records with non-string times before sorting", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-06T12:00:00-07:00"));
    const base = { _id: new Types.ObjectId(), date: "2026-10-06", category: "Cardio" };
    const records = [
      { ...base, time: "13:00" },
      { ...base, time: "23:59" },
      { ...base, time: "12:00" },
      { ...base, time: "00:00" },
      { ...base, time: "24:00" },
      { ...base, time: "09:60" },
      { ...base, time: undefined },
      { ...base, time: null },
      { ...base, time: 900 },
      { ...base, time: "9:00" },
    ];
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue(records),
    };
    vi.spyOn(FitnessClassModel, "find").mockReturnValue(query as unknown as ReturnType<typeof FitnessClassModel.find>);

    const schedule = await classRepository.getSchedule();

    expect(schedule.classes.map((record) => record.time)).toEqual(["00:00", "9:00", "12:00", "13:00", "23:59"]);
  });

  it.each(["UTC", "America/Los_Angeles", "Asia/Tokyo"])(
    "keeps Sunday classes until California midnight on a %s server",
    async (timezone) => {
      vi.stubEnv("TZ", timezone);
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-12T01:00:00Z"));
      const record = { _id: new Types.ObjectId(), date: "2026-10-11", category: "Cardio", time: "19:00" };
      const query = {
        sort: vi.fn().mockReturnThis(),
        lean: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([record]),
      };
      vi.spyOn(FitnessClassModel, "find").mockReturnValue(
        query as unknown as ReturnType<typeof FitnessClassModel.find>,
      );

      const sunday = await classRepository.getSchedule();
      expect(sunday.weekLabel).toBe("October 5—11, 2026");
      expect(sunday.days.find((day) => day.isToday)?.date).toBe("2026-10-11");
      expect(sunday.classes).toHaveLength(1);

      vi.setSystemTime(new Date("2026-10-12T07:00:00Z"));
      const monday = await classRepository.getSchedule();
      expect(monday.days[0].date).toBe("2026-10-12");
      expect(monday.days.find((day) => day.isToday)?.date).toBe("2026-10-12");
      expect(monday.classes).toHaveLength(0);
    },
  );

  it.each([
    ["2026-03-09T06:30:00Z", "2026-03-02", "2026-03-08"],
    ["2026-11-02T07:30:00Z", "2026-10-26", "2026-11-01"],
  ])("keeps the gym calendar correct at DST boundary %s", async (now, monday, today) => {
    vi.stubEnv("TZ", "UTC");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(now));
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(FitnessClassModel, "find").mockReturnValue(query as unknown as ReturnType<typeof FitnessClassModel.find>);
    const schedule = await classRepository.getSchedule();
    expect(schedule.days[0].date).toBe(monday);
    expect(schedule.days.find((day) => day.isToday)?.date).toBe(today);
  });

  it("labels both years when the week crosses New Year", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-01T12:00:00-08:00"));
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([]),
    };
    vi.spyOn(FitnessClassModel, "find").mockReturnValue(query as unknown as ReturnType<typeof FitnessClassModel.find>);
    expect((await classRepository.getSchedule()).weekLabel).toBe("December 28, 2026—January 3, 2027");
  });

  it("round-trips a schedule ID even when the stored record has a legacy numeric ID", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-06T12:00:00-07:00"));
    const record = { _id: new Types.ObjectId(), id: 123, date: "2026-10-06", category: "Cardio", time: "09:00" };
    const listQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([record]),
    };
    vi.spyOn(FitnessClassModel, "find").mockReturnValue(
      listQuery as unknown as ReturnType<typeof FitnessClassModel.find>,
    );
    const lookupQuery = { lean: vi.fn().mockReturnThis(), exec: vi.fn().mockResolvedValue(record) };
    const findOne = vi
      .spyOn(FitnessClassModel, "findOne")
      .mockReturnValue(lookupQuery as unknown as ReturnType<typeof FitnessClassModel.findOne>);
    const schedule = await classRepository.getSchedule();
    const id = schedule.classes[0].id;
    expect(id).toBe(record._id.toString());
    expect((await classRepository.getById(id))?.id).toBe(id);
    expect(findOne).toHaveBeenCalledWith({ _id: id });
  });

  it("looks up a generated ID using _id and preserves result conversion", async () => {
    const id = new Types.ObjectId().toString();
    const record = { _id: new Types.ObjectId(id), date: "2026-10-06", category: "Cardio", time: "09:00" };
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
