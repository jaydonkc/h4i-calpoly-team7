import type { ClassCategory } from "@/types/fitness-class";

export type Preferences = { timeFormat: "12h" | "24h"; defaultClassCategory: "All" | ClassCategory };
export const defaultPreferences: Preferences = { timeFormat: "12h", defaultClassCategory: "All" };
export type Profile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  preferences: Preferences;
};
export type DemoOrder = { id: string; plan: string; amountCents: number; createdAt: string };
export const membershipPlans = { Student: 1000, Standard: 1500, Premium: 3000 } as const;
export type MembershipPlan = keyof typeof membershipPlans;
export function formatClassTime(time: string, format: Preferences["timeFormat"]) {
  if (format === "24h") return time;
  const [hour, minute] = time.split(":");
  return `${Number(hour) % 12 || 12}:${minute}${Number(hour) >= 12 ? "pm" : "am"}`;
}
