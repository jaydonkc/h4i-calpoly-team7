import { Suspense } from "react";
import ClassesPage from "./classes";
import type { ClassQuery, ClassSchedule, FitnessClass } from "@/types/fitness-class";
export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

const URL = "http://localhost:3000";

const emptySchedule: ClassSchedule = {
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
    const response = await fetch(`{URL}/api/classes`, { cache: "no-store" });
    const schedule: ClassSchedule = await response.json(); // Assuming that the data is fetched as ClassSchedule and not the classes prop
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
