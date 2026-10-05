import type { Metadata } from "next";
import { Suspense } from "react";
import { classRepository } from "@/lib/classes/class-repository";
import ClassesPage from "./classes";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };

const emptySchedule: ClassSchedule = {
  weekLabel: "",
  days: [],
  classes: [],
};

export default function ClassesRoute() {
  return (
    <Suspense fallback={<ClassesPage initialSchedule={emptySchedule} errorMessage={"loading"} />}>
      <ClassesContent />
    </Suspense>
  );
}

async function ClassesContent() {
  try {
    const schedule = await classRepository.getSchedule();
    return <ClassesPage initialSchedule={schedule} errorMessage={null} />;
  } catch {
    return (
      <ClassesPage
        initialSchedule={emptySchedule}
        errorMessage={"An issue has occurred. Please reload the page, or try again at a later time."}
      />
    );
  }
}
