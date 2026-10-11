import { ensureIndexes } from "@/database/indexes";
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import connectDB from "@/database/db";
import OrderModel from "@/database/demoOrderSchema";
import MembershipModel from "@/database/membershipSchema";
import { getMembership } from "@/lib/memberships/repository";
import { membershipPlans, type MembershipPlan, type DemoOrder } from "@/types/account";
import { AccountError } from "@/lib/account/http";
type OrderRecord = {
  _id: { toString(): string };
  plan: string;
  amountCents: number;
  createdAt: Date;
};
function orderView(record: OrderRecord): DemoOrder {
  return {
    id: record._id.toString(),
    plan: record.plan,
    amountCents: record.amountCents,
    createdAt: new Date(record.createdAt).toISOString(),
  };
}
export async function listOrders(userId: string): Promise<DemoOrder[]> {
  await connectDB();
  return (await OrderModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean<OrderRecord[]>()).map(orderView);
}
export async function demoCheckout(userId: string, email: string, plan: MembershipPlan, idempotencyKey: string) {
  await connectDB();
  await Promise.all([ensureIndexes(OrderModel), ensureIndexes(MembershipModel)]);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await OrderModel.findOne({ userId, idempotencyKey }).session(session);
      if (existing) {
        if (existing.plan !== plan) throw new AccountError("Start a new checkout for a different plan.", 409);
        return;
      }
      await OrderModel.create(
        [{ userId, idempotencyKey, plan, amountCents: membershipPlans[plan], status: "simulated" }],
        { session },
      );
      const membership = await MembershipModel.findOne({ userId }).session(session);
      // A demo order must not replace a separately granted active membership.
      if (membership?.source === "manual_demo" && membership.status === "active" && membership.expiresAt > new Date())
        return;
      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 1, 1);
      const lastDay = new Date(Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth() + 1, 0)).getUTCDate();
      expiresAt.setUTCDate(Math.min(startsAt.getUTCDate(), lastDay));
      await MembershipModel.updateOne(
        { userId },
        {
          $set: { email, plan, status: "active", source: "demo_checkout", startsAt, expiresAt },
          $setOnInsert: { memberId: `FM-${randomUUID().toUpperCase()}` },
        },
        { upsert: true, session, runValidators: true },
      );
    });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    const existing = await OrderModel.findOne({ userId, idempotencyKey });
    if (!existing || existing.plan !== plan) throw new AccountError("Please retry the demo checkout.", 409);
  } finally {
    await session.endSession();
  }
  return { membership: await getMembership(userId), orders: await listOrders(userId) };
}
