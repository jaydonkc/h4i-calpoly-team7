import { adminAccess } from "@/lib/admin/access";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Error as MongooseError } from "mongoose";
import connectDB from "@/database/db";
import Model from "@/database/userSchema";
import { GET, POST } from "@/app/api/classes/route";
import { resolveClassCoach } from "@/lib/coaches/repository";
import { AccountError } from "@/lib/account/http";

vi.mock("@/lib/admin/access", () => ({ adminAccess: vi.fn(async () => ({ status: 200 })) }));
vi.mock("@/lib/coaches/repository", () => ({
  resolveClassCoach: vi.fn(async (input: unknown) => input),
  resolveCoachNames: async (classes: unknown) => classes,
}));
vi.mock("@/database/db", () => ({ default: vi.fn() }));
vi.mock("@/lib/account/reservations", () => ({ availableSchedule: async (schedule: unknown) => schedule }));
afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

const validClass = {
  date: "2026-10-11",
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
const request = (body: unknown) =>
  new Request("http://localhost/api/classes", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

describe("POST /api/classes", () => {
  it("rejects an instructor missing from the database roster before creating a class", async () => {
    vi.mocked(resolveClassCoach).mockRejectedValueOnce(
      new AccountError("Choose an instructor from the coach roster.", 400),
    );
    const create = vi.spyOn(Model, "create");
    const response = await POST(request({ ...validClass, coachId: "missing-coach" }));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors.coachId).toContain("coach roster");
    expect(create).not.toHaveBeenCalled();
  });
  it.each([401, 403, 503])("denies access with %s before any write", async (status) => {
    vi.mocked(adminAccess).mockResolvedValueOnce({ status, message: "Denied" });
    const create = vi.spyOn(Model, "create");
    const response = await POST(request(validClass));
    expect(response.status).toBe(status);
    expect(create).not.toHaveBeenCalled();
  });
  it("rejects a cross-site mutation before writing", async () => {
    const req = request(validClass);
    req.headers.set("origin", "https://elsewhere.example");
    const response = await POST(req);
    expect(response.status).toBe(403);
    expect(connectDB).not.toHaveBeenCalled();
  });
  it("accepts a leap date, midnight start, and zero spots", async () => {
    const input = { ...validClass, date: "2028-02-29", time: "00:00", end: "00:01", spots: 0 };
    const saved = new Model(input);
    vi.spyOn(Model, "create").mockResolvedValueOnce(saved);
    const response = await POST(request(input));
    expect(response.status).toBe(201);
    expect((await response.json()).data).toEqual({ ...input, id: saved._id.toString() });
  });

  it("awaits saving trimmed input, returns a string public ID, and exposes the record through GET", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T12:00:00-07:00"));
    const saved = new Model(validClass);
    let confirmSave!: (value: typeof saved) => void;
    const create = vi.spyOn(Model, "create").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          confirmSave = resolve;
        }) as ReturnType<typeof Model.create>,
    );
    let completed = false;
    const pending = POST(request({ ...validClass, title: "  Morning Cardio  ", coach: " Alex " })).then((response) => {
      completed = true;
      return response;
    });
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(completed).toBe(false);
    expect(create).toHaveBeenCalledWith(validClass);
    confirmSave(saved);
    const response = await pending;
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, data: { ...validClass, id: saved._id.toString() } });
    const query = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([saved.toObject()]),
    };
    vi.spyOn(Model, "find").mockReturnValue(query as unknown as ReturnType<typeof Model.find>);
    expect((await (await GET(new Request("http://localhost/api/classes"))).json()).data.classes).toEqual([
      { ...validClass, id: saved._id.toString() },
    ]);
  });

  it.each([
    ["title", "   "],
    ["coach", 7],
    ["description", null],
    ["category", "Unknown"],
    ["category", ["Cardio"]],
    ["level", "Expert"],
    ["date", "2026-02-30"],
    ["date", "2025-02-29"],
    ["date", "2026-2-01"],
    ["time", "24:00"],
    ["time", "9:00"],
    ["end", "09:60"],
    ["end", "09:00"],
    ["end", "08:59"],
    ["spots", -1],
    ["spots", 1.5],
    ["spots", "10"],
    ["spots", null],
    ["spots", Number.MAX_SAFE_INTEGER + 1],
    ["id", "injected"],
    ["_id", "injected"],
    ["unexpected", true],
    ["__proto__", "injected"],
  ])("rejects invalid %s=%j without connecting or writing", async (field, value) => {
    const create = vi.spyOn(Model, "create");
    const response = await POST(request({ ...validClass, [field]: value }));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors[field]).toBeDefined();
    expect(connectDB).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it.each(Object.keys(validClass))("requires %s before writing", async (field) => {
    const create = vi.spyOn(Model, "create");
    const response = await POST(request({ ...validClass, [field]: undefined }));
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors[field]).toBeDefined();
    expect(create).not.toHaveBeenCalled();
    expect(connectDB).not.toHaveBeenCalled();
  });

  it.each([null, [], "text", 1])("rejects a non-object body %j", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(connectDB).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without writing", async () => {
    const create = vi.spyOn(Model, "create");
    const response = await POST(
      new Request("http://localhost/api/classes", {
        method: "POST",
        body: "{",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).fieldErrors._form).toBeDefined();
    expect(connectDB).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("returns safe 503 and does not write when connection fails", async () => {
    vi.mocked(connectDB).mockRejectedValueOnce(new Error("mongodb://private-password"));
    const create = vi.spyOn(Model, "create");
    const response = await POST(request(validClass));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      message: "The class could not be saved right now. Please try again.",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("returns safe 503 when saving fails", async () => {
    vi.spyOn(Model, "create").mockRejectedValueOnce(new Error("private write details"));
    const response = await POST(request(validClass));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      success: false,
      message: "The class could not be saved right now. Please try again.",
    });
  });

  it("maps Mongoose validation to safe field errors", async () => {
    const error = new MongooseError.ValidationError();
    error.addError("title", new MongooseError.ValidatorError({ message: "private validator details" }));
    vi.spyOn(Model, "create").mockRejectedValueOnce(error);
    const response = await POST(request(validClass));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      success: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: { title: "Enter a valid value for this field." },
    });
  });

  it("retains schema guards for blank text and end before start", () => {
    const errors = new Model({ ...validClass, title: "  ", end: "08:00" }).validateSync()?.errors;
    expect(errors?.title).toBeDefined();
    expect(errors?.end).toBeDefined();
  });

  it.each([
    ["10:00", true],
    ["09:00", false],
    ["08:00", false],
  ])("validates seeded update times ending at %s", async (end, valid) => {
    const update = { $set: { ...validClass, end } };
    const query = Model.updateOne({}, update, { upsert: true, runValidators: true });
    // Exercise Mongoose's update-validation pipeline without sending a database write.
    const validation = (
      query as unknown as {
        validate(update: unknown, options: unknown, overwrite: boolean): Promise<void>;
      }
    ).validate(update, { runValidators: true }, false);
    if (valid) await expect(validation).resolves.toBeUndefined();
    else await expect(validation).rejects.toThrow("Validation failed");
  });
});
