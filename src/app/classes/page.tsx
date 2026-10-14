import type { Metadata } from "next";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import { pageIdentity } from "@/lib/auth/page-identity";
import { isGymAdmin } from "@/lib/admin/access";
import ClassesLoader from "./ClassesLoader";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

export default async function ClassesRoute({
  searchParams,
}: {
  searchParams: { week?: string | string[]; day?: string; class?: string };
}) {
  const weekStart = typeof searchParams.week === "string" ? searchParams.week : undefined;
  const identity = await pageIdentity();
  const canManage = Boolean(identity.user && isGymAdmin(identity.user));
  const selection = `${searchParams.day ?? ""}:${searchParams.class ?? ""}`;
  try {
    const schedule = await availableSchedule(await classRepository.getSchedule({ weekStart }));
    return (
      <ClassesLoader
        key={`${schedule.days[0]?.date}:${selection}`}
        initialSchedule={schedule}
        weekStart={weekStart}
        canManage={canManage}
      />
    );
  } catch {
    return (
      <ClassesLoader
        key={weekStart ?? "current"}
        weekStart={weekStart}
        canManage={canManage}
        initialError="The class schedule is temporarily unavailable. Please try again."
      />
    );
  }
}
