import type { Model } from "mongoose";

// Models can be loaded while a warm serverless connection reports a stale
// heartbeat. Do not queue operations on Mongoose's connection events; connectDB
// is awaited by callers and these indexes are created explicitly afterward.
const pending = new WeakMap<Model<unknown>, Promise<unknown>>();
export async function ensureIndexes(model: Model<unknown>) {
  let promise = pending.get(model);
  if (!promise) {
    promise = model.createIndexes().catch((error) => {
      pending.delete(model);
      throw error;
    });
    pending.set(model, promise);
  }
  await promise;
}
