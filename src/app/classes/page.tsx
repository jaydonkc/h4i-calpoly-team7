import type { Metadata } from "next";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import ClassesLoader from "./ClassesLoader";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

export default async function ClassesRoute({ searchParams }: { searchParams: { week?: string | string[] } }) {
  const weekStart = typeof searchParams.week === "string" ? searchParams.week : undefined;
  try {
    const schedule = await availableSchedule(await classRepository.getSchedule({ weekStart }));
    return <ClassesLoader key={schedule.days[0]?.date} initialSchedule={schedule} weekStart={weekStart} />;
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
