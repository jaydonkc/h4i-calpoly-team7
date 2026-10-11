"use client";

import { useEffect, useState } from "react";
import type { ClassSchedule } from "@/types/fitness-class";
import { useAuth } from "@/components/AuthProvider";
import ClassesPage from "./classes";

const emptySchedule: ClassSchedule = { weekLabel: "", days: [], classes: [] };

export default function ClassesLoader() {
  const [schedule, setSchedule] = useState<ClassSchedule>(emptySchedule);
  const [errorMessage, setErrorMessage] = useState<string | null>("loading");
  const { reservationsRevision } = useAuth();
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Keep the current schedule and booking confirmation visible during refresh.

    async function loadSchedule() {
      try {
        const response = await fetch("/api/classes", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Schedule request failed");
        const result = await response.json();
        if (
          !result.success ||
          !result.data ||
          !Array.isArray(result.data.days) ||
          !Array.isArray(result.data.classes)
        ) {
          throw new Error("Invalid schedule response");
        }
        if (controller.signal.aborted) return;
        setSchedule(result.data);
        setErrorMessage(null);
      } catch {
        if (!controller.signal.aborted) {
          setErrorMessage("The class schedule is temporarily unavailable. Please try again.");
        }
      }
    }

    void loadSchedule();
    return () => controller.abort();
  }, [attempt, reservationsRevision]);

  return (
    <ClassesPage
      key={errorMessage === null ? (schedule.days[0]?.date ?? "empty") : errorMessage}
      initialSchedule={schedule}
      errorMessage={errorMessage}
      onRetry={() => setAttempt((current) => current + 1)}
    />
  );
}
