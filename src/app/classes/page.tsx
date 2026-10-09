import type { Metadata } from "next";
import { classRepository } from "@/lib/classes/class-repository";
import ClassesPage from "./classes";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

export default async function ClassesRoute() {
  const schedule = await classRepository.getSchedule();
  return <ClassesPage initialSchedule={schedule} />;
}
