"use client";

import { createPortal } from "react-dom";
import { formatClassTime } from "@/types/account";
import { useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { FitnessClass } from "@/types/fitness-class";
import Icon from "./Icon";

type ClassCardProps = {
  fitnessClass: FitnessClass;
};

export default function ClassCard({ fitnessClass }: ClassCardProps) {
  const {
    isUserSignedIn,
    reservedClasses,
    reserveClass,
    cancelReservation,
    preferences,
    reservationsLoading,
    reservationsError,
  } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const isBooked = reservedClasses.some(
    (reservedClass) => reservedClass.id === fitnessClass.id && reservedClass.date === fitnessClass.date,
  );

  async function toggleReservation() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    try {
      if (isBooked) await cancelReservation(fitnessClass);
      else await reserveClass(fitnessClass);
      setShowConfirmation(!isBooked);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update your reservation.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <article className="classcard">
      <div className="table-cell class-time" data-label="Time">
        <strong>{formatClassTime(fitnessClass.time, preferences.timeFormat)}</strong>
        <span>to {formatClassTime(fitnessClass.end, preferences.timeFormat)}</span>
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
        disabled={
          !isUserSignedIn ||
          pending ||
          reservationsLoading ||
          Boolean(reservationsError) ||
          (!isBooked && fitnessClass.spots === 0)
        }
        onClick={toggleReservation}
      >
        {pending
          ? "Saving…"
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
      {showConfirmation &&
        createPortal(
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
          </div>,
          document.body,
        )}
    </article>
  );
}
