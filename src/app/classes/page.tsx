import { Suspense } from "react";
import ClassesPage from "./classes";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";
export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

const URL = "http://localhost:3000";

const emptySchedule: ClassSchedule = {
  weekLabel: "",
  days: [],
  classes: [],
};

export default function ClassesRoute() {
  return <ClassesLoader />;
}
