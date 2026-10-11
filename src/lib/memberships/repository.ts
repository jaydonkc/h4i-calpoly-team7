import connectDB from "@/database/db";
import MembershipModel from "@/database/membershipSchema";
import type { Membership } from "@/types/membership";

export async function getMembership(userId: string): Promise<Membership | null> {
  await connectDB();
  const record = (await MembershipModel.findOne({ userId }).lean()) as {
    plan: string;
    memberId: string;
    expiresAt: Date;
    status: "active" | "expired";
    source: "manual_demo" | "demo_checkout";
  } | null;
  if (!record) return null;
  const expiry = new Date(record.expiresAt);
  return {
    plan: record.plan,
    memberId: record.memberId,
    price: record.source === "manual_demo" ? "Complimentary demo" : "Demo — no charge",
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
