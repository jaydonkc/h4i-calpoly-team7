"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { classCategories } from "@/types/fitness-class";
import { coaches, gymLocations } from "@/data/site-content";

export default function CreateClassForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<{ id: string; date: string; title: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const minutes = (value: string) => Number(value.split(":")[0]) * 60 + Number(value.split(":")[1]);
    const duration = `${minutes(String(values.end)) - minutes(String(values.time))} min`;
    setPending(true);
    setErrors({});
    setSaved(null);
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, duration, spots: Number(values.spots) }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fieldErrors ?? { _form: result.message ?? "Could not save the class." });
        return;
      }
      setSaved(result.data);
      form.reset();
    } catch {
      setErrors({ _form: "Could not save the class. Please try again." });
    } finally {
      setPending(false);
    }
  }
  const error = (field: string) =>
    errors[field] && (
      <small id={`error-${field}`} role="alert">
        {errors[field]}
      </small>
    );
  const props = (field: string) => ({
    name: field,
    id: field,
    required: true,
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `error-${field}` : undefined,
  });
  return (
    <form className="class-create-form" onSubmit={submit}>
      <fieldset disabled={pending}>
        <legend>Class details</legend>
        <label htmlFor="title">Class name</label>
        <input {...props("title")} maxLength={160} />
        {error("title")}
        <label htmlFor="date">Date</label>
        <input {...props("date")} type="date" />
        {error("date")}
        <label htmlFor="time">Start time</label>
        <input {...props("time")} type="time" />
        {error("time")}
        <label htmlFor="end">End time</label>
        <input {...props("end")} type="time" />
        {error("end")}
        <label htmlFor="category">Class type</label>
        <select {...props("category")}>
          {classCategories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        {error("category")}
        <label htmlFor="coach">Coach</label>
        <select {...props("coach")}>
          {coaches.map((coach) => (
            <option key={coach.name}>{coach.name}</option>
          ))}
        </select>
        {error("coach")}
        <label htmlFor="location">Location</label>
        <select {...props("location")}>
          {gymLocations.map((location) => (
            <option key={location.name}>{location.name}</option>
          ))}
        </select>
        {error("location")}
        <label htmlFor="room">Room</label>
        <input {...props("room")} maxLength={160} />
        {error("room")}
        <label htmlFor="level">Difficulty</label>
        <select {...props("level")}>
          {["All levels", "Beginner", "Intermediate", "Advanced"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        {error("level")}
        <label htmlFor="spots">Capacity</label>
        <input {...props("spots")} type="number" min="0" max="1000" step="1" />
        {error("spots")}
        <label htmlFor="description">Description</label>
        <textarea {...props("description")} rows={4} maxLength={2000} />
        {error("description")}
        {error("duration")}
        {error("_form")}
        <button type="submit">{pending ? "Saving…" : "Create class"}</button>
      </fieldset>
      {saved && (
        <p role="status">
          {saved.title} is saved.{" "}
          <Link
            href={`/classes?week=${saved.date}&day=${saved.date}&class=${saved.id}#class-${saved.id}-${saved.date}`}
          >
            View in the schedule
          </Link>
          .
        </p>
      )}
    </form>
  );
}
