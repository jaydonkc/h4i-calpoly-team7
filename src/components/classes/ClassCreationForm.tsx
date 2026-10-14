"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { classReturnPath } from "@/lib/auth/redirect";
import { gymLocations } from "@/data/site-content";
import type { FitnessClass } from "@/types/fitness-class";
import { classCategories } from "@/types/fitness-class";
import type { Coach } from "@/types/coach";

export default function ClassCreationForm({
  date,
  classes,
  onCreated,
}: {
  date: string;
  classes: FitnessClass[];
  onCreated: () => void;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [coachSelection, setCoachSelection] = useState("");
  const [editing, setEditing] = useState<FitnessClass | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [removing, setRemoving] = useState<FitnessClass | null>(null);
  const removeDialog = useRef<HTMLDialogElement>(null);
  const selected = classes.find((item) => String(item.id) === selectedId);
  useEffect(() => {
    if (removing) removeDialog.current?.showModal();
  }, [removing]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/coaches", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.coaches)) throw new Error("Unable to load the coach roster.");
        if (!controller.signal.aborted) {
          setCoaches(result.coaches);
          if (editing)
            setCoachSelection(
              editing.coachId ?? result.coaches.find((item: Coach) => item.name === editing.coach)?.id ?? "",
            );
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("Unable to load instructors. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, attempt, editing]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form);
    const coach = coaches.find((item) => item.id === values.coachId);
    if (!coach) {
      setError("Choose an instructor from the roster.");
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setFields({});
    const minutes = (time: string) => {
      const [hour, minute] = time.split(":").map(Number);
      return hour * 60 + minute;
    };
    try {
      const response = await fetch(editing ? `/api/classes/${editing.id}` : "/api/classes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          coach: coach.name,
          spots: Number(values.spots),
          duration: `${minutes(String(values.end)) - minutes(String(values.time))} min`,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setFields(result.fieldErrors ?? {});
        throw new Error(result.message ?? "The class could not be saved. Please try again.");
      }
      setStatus(editing ? "Class updated." : "Class created.");
      dialog.current?.close();
      onCreated();
      router.push(classReturnPath(String(result.data.id), result.data.date));
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save the class.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const fieldError = (name: string) =>
    fields[name] ? (
      <small id={`class-error-${name}`} role="alert">
        {fields[name]}
      </small>
    ) : null;
  const attributes = (name: string) => ({
    "aria-invalid": Boolean(fields[name]),
    "aria-describedby": fields[name] ? `class-error-${name}` : undefined,
  });
  return (
    <div className="staff-class-tools shell">
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setStatus("");
          setFields({});
          setEditing(null);
          setCoachSelection("");
          setOpen(true);
        }}
      >
        Create class
      </button>
      <div className="staff-edit-controls">
        <label>
          Manage a scheduled class
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Choose a class</option>
            {classes.map((item) => (
              <option key={String(item.id)} value={String(item.id)}>
                {item.date} · {item.time} · {item.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!selected || pending}
          onClick={(event) => {
            if (!selected) return;
            trigger.current = event.currentTarget;
            setStatus("");
            setFields({});
            setEditing(selected);
            setCoachSelection(selected.coachId ?? "");
            setOpen(true);
          }}
        >
          Edit class
        </button>
        <button
          type="button"
          disabled={!selected || pending}
          onClick={(event) => {
            if (!selected) return;
            trigger.current = event.currentTarget;
            setError("");
            setRemoving(selected);
          }}
        >
          Remove class
        </button>
      </div>
      {status && <p role="status">{status}</p>}
      <dialog
        ref={dialog}
        className="class-creation-dialog"
        aria-labelledby="class-create-title"
        onCancel={(event) => {
          if (busy.current) event.preventDefault();
        }}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
      >
        <h2 id="class-create-title">{editing ? "Edit class" : "Create a class"}</h2>
        <p>Dates and times use Los Angeles time.</p>
        {error && (
          <p role="alert">
            {error}{" "}
            {coaches.length === 0 && (
              <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                Retry instructors
              </button>
            )}
          </p>
        )}
        <form key={editing ? String(editing.id) : "new"} onSubmit={save}>
          <label>
            Class name
            <input
              name="title"
              defaultValue={editing?.title}
              required
              maxLength={160}
              autoFocus
              {...attributes("title")}
            />
            {fieldError("title")}
          </label>
          <label>
            Class type
            <select name="category" defaultValue={editing?.category} required>
              {classCategories.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            {fieldError("category")}
          </label>
          <label>
            Date
            <input name="date" type="date" defaultValue={editing?.date ?? date} required {...attributes("date")} />
            {fieldError("date")}
          </label>
          <div className="class-form-row">
            <label>
              Start time
              <input
                name="time"
                type="time"
                defaultValue={editing?.time.padStart(5, "0")}
                required
                {...attributes("time")}
              />
              {fieldError("time")}
            </label>
            <label>
              End time
              <input
                name="end"
                type="time"
                defaultValue={editing?.end.padStart(5, "0")}
                required
                {...attributes("end")}
              />
              {fieldError("end")}
            </label>
          </div>
          <label>
            Instructor
            <select
              name="coachId"
              required
              value={coachSelection}
              onChange={(event) => setCoachSelection(event.target.value)}
              disabled={loading}
              {...attributes("coachId")}
            >
              <option value="">{loading ? "Loading instructors…" : "Choose an instructor"}</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.name}
                </option>
              ))}
            </select>
            {fieldError("coachId")}
          </label>
          <label>
            Location
            <select name="location" defaultValue={editing?.location} required>
              {gymLocations.map((location) => (
                <option key={location.name}>{location.name}</option>
              ))}
            </select>
            {fieldError("location")}
          </label>
          <label>
            Room
            <input name="room" defaultValue={editing?.room} required maxLength={160} {...attributes("room")} />
            {fieldError("room")}
          </label>
          <label>
            Difficulty
            <select name="level" defaultValue={editing?.level} required>
              {["All levels", "Beginner", "Intermediate", "Advanced"].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            {fieldError("level")}
          </label>
          <label>
            Capacity
            <input
              name="spots"
              type="number"
              min="0"
              step="1"
              defaultValue={editing?.capacity ?? editing?.spots ?? 12}
              required
              {...attributes("spots")}
            />
            {fieldError("spots")}
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={editing?.description}
              required
              maxLength={2000}
              rows={3}
              {...attributes("description")}
            />
            {fieldError("description")}
          </label>
          <div className="class-form-actions">
            <button type="submit" disabled={pending || loading || !coaches.length}>
              {pending ? "Saving…" : editing ? "Save changes" : "Create class"}
            </button>
            <button type="button" disabled={pending} onClick={() => dialog.current?.close()}>
              Cancel
            </button>
          </div>
        </form>
      </dialog>
      <dialog
        ref={removeDialog}
        className="class-creation-dialog"
        aria-labelledby="class-remove-title"
        onCancel={(event) => {
          if (busy.current) event.preventDefault();
        }}
        onClose={() => {
          setRemoving(null);
          trigger.current?.focus();
        }}
      >
        <h2 id="class-remove-title">Remove this class from the schedule?</h2>
        <p>
          {removing?.title} · {removing?.date}
        </p>
        <p>Classes with reservations must have those reservations canceled first.</p>
        {error && <p role="alert">{error}</p>}
        <div className="class-form-actions">
          <button type="button" disabled={pending} autoFocus onClick={() => removeDialog.current?.close()}>
            Keep class
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              if (!removing || busy.current) return;
              busy.current = true;
              setPending(true);
              setError("");
              try {
                const response = await fetch(`/api/classes/${removing.id}`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message ?? "Unable to remove the class.");
                removeDialog.current?.close();
                setSelectedId("");
                setStatus("Class removed from the schedule.");
                onCreated();
                router.refresh();
              } catch (error) {
                setError(error instanceof Error ? error.message : "Unable to remove the class.");
              } finally {
                busy.current = false;
                setPending(false);
              }
            }}
          >
            {pending ? "Removing…" : "Remove class"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
