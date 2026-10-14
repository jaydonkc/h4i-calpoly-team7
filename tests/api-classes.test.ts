import { afterEach, describe, expect, it, vi } from "vitest";
import connectDB from "@/database/db";
import Model from "@/database/userSchema";
import { GET } from "@/app/api/classes/route";
import { Types } from "mongoose";

vi.mock("@/lib/account/reservations", () => ({ availableSchedule: async (schedule: unknown) => schedule }));
vi.mock("@/database/db", () => ({ default: vi.fn() }));
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

function mockRecords(records: unknown[]) {
  const query = {
    sort: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn().mockResolvedValue(records),
  };
  return vi.spyOn(Model, "find").mockReturnValue(query as unknown as ReturnType<typeof Model.find>);
}

describe("GET /api/classes", () => {
  it("returns a populated schedule with string IDs and deterministic time ordering using one read", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T12:00:00-07:00"));
    const base = { _id: new Types.ObjectId(), date: "2026-10-10", category: "Cardio" };
    const find = mockRecords([
      { ...base, time: "19:00" },
      { ...base, _id: new Types.ObjectId(), time: "09:00" },
    ]);
    const response = await GET(new Request("http://localhost/api/classes"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.classes.map((record: { time: string }) => record.time)).toEqual(["09:00", "19:00"]);
    expect(body.data.classes[1].id).toBe(base._id.toString());
    expect(find).toHaveBeenCalledOnce();
    expect(connectDB).toHaveBeenCalledOnce();
  });

  it("returns 200 and calendar metadata when the database is empty", async () => {
    mockRecords([]);
    const response = await GET(new Request("http://localhost/api/classes"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.classes).toEqual([]);
    expect(body.data.days).toHaveLength(7);
  });

  it("returns safe JSON 503 when connecting fails", async () => {
    vi.mocked(connectDB).mockRejectedValueOnce(new Error("private connection details"));
    const response = await GET(new Request("http://localhost/api/classes"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      message: "The class schedule is temporarily unavailable. Please try again.",
    });
  });

  it("returns safe JSON 503 when the query fails", async () => {
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockRejectedValue(new Error("private query details")),
    };
    vi.spyOn(Model, "find").mockReturnValue(query as unknown as ReturnType<typeof Model.find>);
    const response = await GET(new Request("http://localhost/api/classes"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      message: "The class schedule is temporarily unavailable. Please try again.",
    });
  });
});
