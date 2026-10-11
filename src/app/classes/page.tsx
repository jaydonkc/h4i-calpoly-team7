import type { Metadata } from "next";
import ClassesLoader from "./ClassesLoader";

export const metadata: Metadata = { title: "Class Schedule | Fitness Maxxing" };
export const dynamic = "force-dynamic";

export default function ClassesRoute() {
  return <ClassesLoader />;
}
