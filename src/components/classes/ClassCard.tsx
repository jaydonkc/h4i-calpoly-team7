"use client";

import { getClassStatus } from "@/lib/classes/class-start";
import { useRouter } from "next/navigation";
import { classReturnPath, loginPath } from "@/lib/auth/redirect";
import { formatClassTime } from "@/types/account";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { FitnessClass } from "@/types/fitness-class";
import Icon from "./Icon";
import { getClassStatus } from "@/lib/classes/class-start";

type ClassCardProps = {
  fitnessClass: FitnessClass;
  onBooked?: (fitnessClass: FitnessClass) => void;
  onCanceled?: (fitnessClass: FitnessClass) => void;
};

export default function ClassCard({ fitnessClass, onBooked, onCanceled }: ClassCardProps) {
  const router = useRouter();
  const {
    isUserSignedIn,
    isLoading,
    reservedClasses,
    reserveClass,
    cancelReservation,
    preferences,
    reservationsLoading,
    reservationsError,
  } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const busy = useRef(false);
  const reserveButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (
      isUserSignedIn &&
      !reservationsLoading &&
      query.get("class") === String(fitnessClass.id) &&
      query.get("day") === fitnessClass.date
    ) {
      reserveButton.current?.focus();
      reserveButton.current?.scrollIntoView({ block: "center" });
    }
  }, [isUserSignedIn, reservationsLoading, fitnessClass.id, fitnessClass.date]);
  const isBooked = reservedClasses.some(
    (reservedClass) => reservedClass.id === fitnessClass.id && reservedClass.date === fitnessClass.date,
  );

  const status = getClassStatus(fitnessClass.date, fitnessClass.time, fitnessClass.end, now);
  const hasStarted = status !== "Upcoming";

  async function toggleReservation() {
    if (hasStarted) return;
    if (!isUserSignedIn) {
      router.push(loginPath(classReturnPath(String(fitnessClass.id), fitnessClass.date)));
      return;
    }
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      if (isBooked) {
        await cancelReservation(fitnessClass);
        onCanceled?.(fitnessClass);
      } else {
        await reserveClass(fitnessClass);
        onBooked?.(fitnessClass);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update your reservation.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <article className="classcard" id={`class-${fitnessClass.id}-${fitnessClass.date}`}>
      <div className="table-cell class-time" data-label="Time">
        <strong>{formatClassTime(fitnessClass.time, preferences.timeFormat)}</strong>
        <span>to {formatClassTime(fitnessClass.end, preferences.timeFormat)}</span>
      </div>
      <div className="table-cell classmain" data-label="Class">
        <div>
          <mark className={{ Strength: "coral", Cardio: "yellow", "Mind & Body": "blue" }[fitnessClass.category]}>
            {fitnessClass.category}
          </mark>
        </div>
        <h3>{fitnessClass.title}</h3>
        <p className="class-description">{fitnessClass.description}</p>
      </div>
      <div className="table-cell" data-label="Instructor">
        <Icon name="user" />
        <span>{fitnessClass.coach}</span>
      </div>
      <div className="table-cell" data-label="Location">
        <Icon name="pin" />
        <span>{fitnessClass.location ?? fitnessClass.room}</span>
      </div>
      <div className="table-cell" data-label="Duration">
        {fitnessClass.duration}
      </div>
      <div className="table-cell" data-label="Difficulty">
        {fitnessClass.level}
      </div>
      <div className="table-cell availability" data-label="Availability">
        <strong>{fitnessClass.spots}</strong>
        <span> spots</span>
      </div>
      <button
        ref={reserveButton}
        className={`reserve ${isBooked ? "cancel" : ""}`}
        aria-pressed={isUserSignedIn ? isBooked : undefined}
        aria-label={
          isLoading || pending
            ? undefined
            : hasStarted
              ? `${status}: ${fitnessClass.title}`
              : isUserSignedIn
                ? undefined
                : `Log in to reserve ${fitnessClass.title}`
        }
        disabled={
          isLoading ||
          pending ||
          (isUserSignedIn && reservationsLoading) ||
          (isUserSignedIn && Boolean(reservationsError)) ||
          (isUserSignedIn && !isBooked && fitnessClass.spots === 0) ||
          hasStarted
        }
        onClick={toggleReservation}
      >
        {isLoading
          ? "Checking session…"
          : pending
            ? "Saving…"
            : hasStarted
              ? status
              : isUserSignedIn
                ? isBooked
                  ? "Cancel"
                  : fitnessClass.spots === 0
                    ? "Full"
                    : "Reserve"
                : "Log in to reserve"}
      </button>
      {error && (
        <p role="alert" className="reservation-error">
          {error}
        </p>
      )}
    </article>
  );
}
