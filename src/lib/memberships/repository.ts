import connectDB from "@/database/db";
import { randomUUID } from "node:crypto";
import { ensureIndexes } from "@/database/indexes";
import MembershipModel from "@/database/membershipSchema";
import type { Membership } from "@/types/membership";

export async function ensureDemoMembership(userId: string, email: string): Promise<Membership | null> {
  await connectDB();
  await ensureIndexes(MembershipModel);
  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);
  try {
    await MembershipModel.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          email,
          plan: "Basic",
          memberId: `FM-${randomUUID().toUpperCase()}`,
          status: "active",
          source: "default_demo",
          startsAt,
          expiresAt,
        },
      },
      { upsert: true, runValidators: true },
    );
  } catch (error) {
    // Concurrent first loads may insert the same user; return the saved membership.
    if ((error as { code?: number }).code !== 11000) throw error;
  }
  return getMembership(userId);
}

export async function getMembership(userId: string): Promise<Membership | null> {
  await connectDB();
  const record = (await MembershipModel.findOne({ userId }).lean()) as {
    plan: string;
    memberId: string;
    expiresAt: Date;
    status: "active" | "expired";
    source: Membership["source"];
  } | null;
  if (!record) return null;
  const expiry = new Date(record.expiresAt);
  return {
    plan: record.plan,
    memberId: record.memberId,
    price: record.source === "demo_checkout" ? "No charge" : "Complimentary",
    source: record.source,
    renewalDate: new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(expiry),
    status: record.status === "active" && expiry > new Date() ? "active" : "expired",
  };
}
