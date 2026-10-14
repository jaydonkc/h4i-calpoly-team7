"use client";

import { createPortal } from "react-dom";
import type { FitnessClass } from "@/types/fitness-class";
import Icon from "./Icon";

export default function BookingNotice({
  fitnessClass,
  onDismiss,
}: {
  fitnessClass: FitnessClass | null;
  onDismiss: () => void;
}) {
  if (!fitnessClass) return null;
  return createPortal(
    <div className="booking-popup" role="status" aria-live="polite">
      <span>
        <Icon name="check" />
      </span>
      <div>
        <strong>Class Booked!</strong>
        <small>{fitnessClass.title}</small>
      </div>
      <button type="button" aria-label="Dismiss confirmation" onClick={onDismiss}>
        ×
      </button>
    </div>,
    document.body,
  );
}
