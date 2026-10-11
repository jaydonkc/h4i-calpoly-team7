import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import type { User } from "@supabase/supabase-js";
import { loadProfile, saveProfile, savePreferences } from "@/lib/account/profiles";
import { reserve, cancel, availableSchedule, listReservations } from "@/lib/account/reservations";
import { demoCheckout } from "@/lib/account/checkout";
import { classRepository } from "@/lib/classes/class-repository";
import { getGymCalendarDate, toIsoDate } from "@/lib/classes/class-dates";
import ClassModel from "@/database/userSchema";
import ReservationModel from "@/database/reservationSchema";
import OccurrenceModel from "@/database/classOccurrenceSchema";
import OrderModel from "@/database/demoOrderSchema";
import MembershipModel from "@/database/membershipSchema";
const scope = vi.hoisted(() => ({ prefix: `accounttest_${Date.now()}_${Math.random().toString(16).slice(2, 10)}` }));
vi.mock("@/database/accountSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/accountSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_profiles`, actual.default.schema, `${scope.prefix}_profiles`) };
});
vi.mock("@/database/reservationSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/reservationSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_reservations`, actual.default.schema, `${scope.prefix}_reservations`) };
});
vi.mock("@/database/classOccurrenceSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/classOccurrenceSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_occurrences`, actual.default.schema, `${scope.prefix}_occurrences`) };
});
vi.mock("@/database/demoOrderSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/demoOrderSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_orders`, actual.default.schema, `${scope.prefix}_orders`) };
});
vi.mock("@/database/membershipSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/membershipSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_memberships`, actual.default.schema, `${scope.prefix}_memberships`) };
});
vi.mock("@/database/userSchema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/database/userSchema")>();
  const { default: db } = await import("mongoose");
  return { default: db.model(`${scope.prefix}_classes`, actual.default.schema, `${scope.prefix}_classes`) };
});
const integration = process.env.ACCOUNT_INTEGRATION_TESTS === "1" ? describe : describe.skip;
integration("MongoDB account persistence and transactions in isolated test collections", () => {
  const user = {
    id: "test-owner",
    email: "test@example.com",
    user_metadata: { first_name: "Original", last_name: "Member", phone: "8055550147" },
  } as unknown as User;
  let classId: string;
  const date = toIsoDate(getGymCalendarDate(new Date()));
  beforeAll(async () => {
    const originalEnvironment = process.env.NODE_ENV;
    vi.stubEnv("NODE_ENV", "development");
    loadEnvConfig(process.cwd(), true);
    vi.stubEnv("NODE_ENV", originalEnvironment);
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI required for explicit integration run");
    // The Atlas credential is scoped to the app database. All models above use
    // unique disposable collections; normal app records are never queried.
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    classId = String(
      (
        await ClassModel.create({
          date,
          time: "23:59",
          end: "23:59",
          title: "Test class",
          category: "Cardio",
          coach: "Test Coach",
          room: "Test Studio",
          level: "Beginner",
          duration: "1 min",
          spots: 1,
          description: "Isolated transaction test",
        })
      )._id,
    );
  }, 30000);
  afterAll(async () => {
    try {
      const collections = await mongoose.connection
        .db!.listCollections({ name: { $regex: `^${scope.prefix}_` } })
        .toArray();
      for (const collection of collections) await mongoose.connection.db!.dropCollection(collection.name);
    } finally {
      await mongoose.disconnect();
    }
  }, 30000);
  it("imports metadata once and persists MongoDB edits and preferences independently per account", async () => {
    expect((await loadProfile(user)).firstName).toBe("Original");
    await saveProfile(user, { firstName: "Updated", lastName: "Member", phone: "8055550199" });
    await savePreferences(user, { timeFormat: "24h", defaultClassCategory: "Cardio" });
    const persisted = await loadProfile({ ...user, user_metadata: { first_name: "Stale" } });
    expect(persisted.firstName).toBe("Updated");
    expect(persisted.phone).toBe("8055550199");
    expect(persisted.preferences.timeFormat).toBe("24h");
    expect((await loadProfile({ ...user, id: "other-owner" })).firstName).toBe("Original");
  });
  it("reserves the last seat once under concurrency, prevents duplicates and isolates cancellations", async () => {
    const results = await Promise.allSettled([reserve(user.id, classId, date), reserve("other-owner", classId, date)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(await ReservationModel.countDocuments({ classId, date })).toBe(1);
    const reservation = await ReservationModel.findOne({ classId, date });
    const owner = reservation!.userId;
    await reserve(owner, classId, date);
    expect(await ReservationModel.countDocuments({ classId, date })).toBe(1);
    expect((await availableSchedule(await classRepository.getSchedule())).classes[0].spots).toBe(0);
    await cancel("unrelated-owner", classId, date);
    expect(await ReservationModel.countDocuments({ classId, date })).toBe(1);
    await cancel(owner, classId, date);
    await cancel(owner, classId, date);
    expect(await listReservations(owner)).toEqual([]);
    expect((await OccurrenceModel.findOne({ classId, date }))!.reservedCount).toBe(0);
    expect((await availableSchedule(await classRepository.getSchedule())).classes[0].spots).toBe(1);
  }, 30000);
  it("rejects nonexistent or past classes without creating reservations", async () => {
    await expect(reserve(user.id, classId, "2000-01-01")).rejects.toMatchObject({ status: 404 });
    expect(await ReservationModel.countDocuments()).toBe(0);
  });
  it("persists demo checkout once per retry, uses server prices, and prevents conflicting reuse", async () => {
    const key = randomUUID();
    const results = await Promise.all([
      demoCheckout(user.id, user.email!, "Premium", key),
      demoCheckout(user.id, user.email!, "Premium", key),
    ]);
    expect(results[0].membership?.source).toBe("demo_checkout");
    expect(await OrderModel.countDocuments({ userId: user.id })).toBe(1);
    expect(results[1].orders[0].amountCents).toBe(3000);
    await expect(demoCheckout(user.id, user.email!, "Student", key)).rejects.toMatchObject({ status: 409 });
    expect(await OrderModel.countDocuments({ userId: user.id })).toBe(1);
  }, 30000);
  it("preserves an active manual membership when saving a demo order", async () => {
    await MembershipModel.create({
      userId: "manual-owner",
      email: user.email,
      plan: "Standard",
      memberId: randomUUID(),
      status: "active",
      source: "manual_demo",
      startsAt: new Date(),
      expiresAt: new Date("2099-01-01"),
    });
    const result = await demoCheckout("manual-owner", user.email!, "Student", randomUUID());
    expect(result.membership?.plan).toBe("Standard");
    expect(result.membership?.source).toBe("manual_demo");
    expect(result.orders).toHaveLength(1);
  });
});
