import { afterEach, describe, expect, it, vi } from "vitest";
import connectDB from "@/database/db";
import { GET } from "@/app/api/example/route";

vi.mock("@/database/db", () => ({
  default: vi.fn(),
}));

const mockConnectDB = vi.mocked(connectDB);

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/example", () => {
  it("returns the API response after the database connects", async () => {
    mockConnectDB.mockResolvedValue({} as Awaited<ReturnType<typeof connectDB>>);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ message: "Hello from the API!" });
    expect(mockConnectDB).toHaveBeenCalledOnce();
  });

  it("returns a 503 response when the database is unavailable", async () => {
    mockConnectDB.mockRejectedValue(new Error("Database unavailable"));

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Database unavailable" });
    expect(mockConnectDB).toHaveBeenCalledOnce();
  });
});
