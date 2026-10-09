"use client";

import { useEffect, useState } from "react";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import type { FitnessClass } from "@/types/fitness-class";
import Icon from "./Icon";

type ClassCardProps = {
  fitnessClass: FitnessClass;
};

export default function ClassCard({ fitnessClass }: ClassCardProps) {
  const { isUserSignedIn, reservedClasses, reserveClass, cancelReservation } = useDemoAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const isBooked = reservedClasses.some((reservedClass) => reservedClass.id === fitnessClass.id);

  useEffect(() => {
    if (!showConfirmation) return;

    const timeout = window.setTimeout(() => setShowConfirmation(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [showConfirmation]);

  function toggleReservation() {
    if (isBooked) {
      cancelReservation(fitnessClass.id);
      setShowConfirmation(false);
      return;
    }

    reserveClass(fitnessClass);
    setShowConfirmation(true);
  }

  return (
    <article className="classcard">
      <div className="table-cell class-time" data-label="Time">
        <strong>{fitnessClass.time}</strong>
        <span>to {fitnessClass.end}</span>
      </div>
      <div className="table-cell classmain" data-label="Class">
        <div>
          <mark>{fitnessClass.category}</mark>
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
        <span>{fitnessClass.room}</span>
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
        className={`reserve ${isBooked ? "cancel" : ""}`}
        aria-pressed={isUserSignedIn ? isBooked : undefined}
        aria-label={isUserSignedIn ? undefined : `Log in to reserve ${fitnessClass.title}`}
        disabled={!isUserSignedIn}
        onClick={toggleReservation}
      >
        {isUserSignedIn ? (isBooked ? "Cancel" : "Reserve") : "Log in to reserve"}
      </button>
      {showConfirmation && (
        <div className="booking-popup" role="status" aria-live="polite">
          <span>
            <Icon name="check" />
          </span>
          <div>
            <strong>Class Booked!</strong>
            <small>{fitnessClass.title}</small>
          </div>
          <button aria-label="Dismiss confirmation" onClick={() => setShowConfirmation(false)}>
            ×
          </button>
        </div>
      )}
    </article>
  );
}
