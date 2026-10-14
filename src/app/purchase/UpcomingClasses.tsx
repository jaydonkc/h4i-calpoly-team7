"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import ClassCard from "@/components/classes/ClassCard";
import BookingNotice from "@/components/classes/BookingNotice";
import { hasClassStarted } from "@/lib/classes/class-start";
import type { ClassSchedule, FitnessClass } from "@/types/fitness-class";
import "@/app/classes/classes.css";

export default function UpcomingClasses({ initialClasses }: { initialClasses: FitnessClass[] }) {
  const { reservationsRevision } = useAuth();
  const [classes, setClasses] = useState(initialClasses);
  const [booked, setBooked] = useState<FitnessClass | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/classes", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result: { success: boolean; data: ClassSchedule } = await response.json();
        if (!response.ok || !result.success) throw new Error();
        if (!controller.signal.aborted) {
          setClasses(result.data.classes.filter((item) => !hasClassStarted(item.date, item.time)).slice(0, 4));
          setError("");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Availability could not be refreshed. Please retry.");
      });
    return () => controller.abort();
  }, [reservationsRevision, attempt]);
  return (
    <div id="top" className="purchase-upcoming-classes">
      {error && (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Retry availability
          </button>
        </p>
      )}
      {classes.length ? (
        classes.map((item) => (
          <div key={`${item.id}:${item.date}`}>
            <h3>
              {new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                timeZone: "UTC",
              })}
            </h3>
            <ClassCard
              fitnessClass={item}
              onBooked={setBooked}
              onCanceled={(canceled) =>
                setBooked((current) => (current?.id === canceled.id && current.date === canceled.date ? null : current))
              }
            />
          </div>
        ))
      ) : (
        <p className="purchaseNotice">No upcoming classes are scheduled this week.</p>
      )}
      <BookingNotice fitnessClass={booked} onDismiss={() => setBooked(null)} />
    </div>
  );
}
