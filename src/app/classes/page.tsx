import Link from "next/link";
import { adminAccess } from "@/lib/admin/access";
import type { Metadata } from "next";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import ClassesLoader from "./ClassesLoader";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

export default async function ClassesRoute({ searchParams }: { searchParams: { week?: string | string[] } }) {
  const weekStart = typeof searchParams.week === "string" ? searchParams.week : undefined;
  const access = await adminAccess();
  try {
    const schedule = await availableSchedule(await classRepository.getSchedule({ weekStart }));
    return (
      <>
        {access.status === 200 && (
          <div className="shell">
            <Link href="/classes/new">Create a class →</Link> · <Link href="/admin/messages">Message inbox</Link>
          </div>
        )}
        <ClassesLoader key={schedule.days[0]?.date} initialSchedule={schedule} weekStart={weekStart} />
      </>
    );
  } catch {
    return (
      <ClassesLoader
        key={weekStart ?? "current"}
        weekStart={weekStart}
        initialError="The class schedule is temporarily unavailable. Please try again."
      />
    );
  }
}
