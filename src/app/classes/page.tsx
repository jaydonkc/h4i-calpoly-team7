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
  return (
    <Suspense fallback={<ClassesPage initialSchedule={emptySchedule} errorMessage={"loading"} />}>
      <ClassesContent />
    </Suspense>
  );
}

async function ClassesContent() {
  try {
    const requestHeaders = headers();
    const host = requestHeaders.get("host");
    const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${protocol}://${host}`;
    const response = await fetch(`${baseUrl}/api/classes`);

    if (!response.ok) {
      throw new Error("An error has occurred");
    }

    const schedule: ClassSchedule = await response.json();
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
