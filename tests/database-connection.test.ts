import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  connection: { readyState: 0, pendingConnect: undefined as Promise<unknown> | undefined },
  connect: vi.fn(),
}));
vi.mock("mongoose", () => ({ default: mock }));
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mock.connection.readyState = 0;
  mock.connection.pendingConnect = undefined;
  vi.stubEnv("MONGO_URI", "mongodb://test-only");
});
describe("MongoDB serverless connection lifecycle", () => {
  it("shares an in-flight connect across simultaneous requests", async () => {
    let finish!: () => void;
    mock.connect.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => {
            mock.connection.readyState = 1;
            resolve(mock);
          };
        }),
    );
    const { default: connectDB } = await import("@/database/db");
    const first = connectDB(),
      second = connectDB();
    finish();
    await Promise.all([first, second]);
    expect(mock.connect).toHaveBeenCalledOnce();
    expect(mock.connection.pendingConnect).toBeUndefined();
  });
  it("reconnects after a previously successful connection closes", async () => {
    mock.connect.mockImplementation(async () => {
      mock.connection.readyState = 1;
      return mock;
    });
    const { default: connectDB } = await import("@/database/db");
    await connectDB();
    await connectDB();
    expect(mock.connect).toHaveBeenCalledOnce();
    mock.connection.readyState = 0;
    await connectDB();
    expect(mock.connect).toHaveBeenCalledTimes(2);
  });
  it("allows retry after connection rejection", async () => {
    mock.connect.mockRejectedValueOnce(new Error("network unavailable")).mockResolvedValueOnce(mock);
    const { default: connectDB } = await import("@/database/db");
    await expect(connectDB()).rejects.toThrow("network unavailable");
    await connectDB();
    expect(mock.connect).toHaveBeenCalledTimes(2);
  });
  it("rejects missing configuration before opening a connection", async () => {
    vi.stubEnv("MONGO_URI", "");
    const { default: connectDB } = await import("@/database/db");
    await expect(connectDB()).rejects.toThrow("not configured");
    expect(mock.connect).not.toHaveBeenCalled();
  });
});
