import type { Metadata } from "next";
import { classRepository } from "@/lib/classes/class-repository";
import ClassesPage from "./classes";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };

export default async function ClassesRoute() {
  try {
    const schedule = await classRepository.getSchedule();
    return <ClassesPage initialSchedule={schedule} errorMessage={null} />;
  } catch {
    const emptySchedule: ClassSchedule = {
      weekLabel: "",
      days: [],
      classes: [],
    };
    return (
      <ClassesPage
        initialSchedule={emptySchedule}
        errorMessage={"An issue has occurred. Please reload the page, or try again at a later time."}
      />
    );
  }
}
