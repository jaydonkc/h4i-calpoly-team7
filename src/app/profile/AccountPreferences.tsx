"use client";
import { useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { classCategories } from "@/types/fitness-class";
import type { Preferences } from "@/types/account";
import styles from "./profile.module.css";
export default function AccountPreferences() {
  const { preferences, updatePreferences, profileLoading, profileError } = useAuth();
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const busy = useRef(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = new FormData(event.currentTarget);
    busy.current = true;
    setPending(true);
    setMessage("");
    setError("");
    try {
      await updatePreferences({
        timeFormat: String(form.get("timeFormat")) as Preferences["timeFormat"],
        defaultClassCategory: String(form.get("defaultClassCategory")) as Preferences["defaultClassCategory"],
      });
      setMessage("Preferences saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save preferences.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return (
    <section className={styles.accountCard} aria-labelledby="preferences-title">
      <h2 id="preferences-title">Preferences</h2>
      {profileLoading ? (
        <p role="status">Loading preferences…</p>
      ) : profileError ? (
        <p>Preferences are unavailable until your profile loads.</p>
      ) : (
        <form
          className={styles.editForm}
          onSubmit={save}
          key={`${preferences.timeFormat}-${preferences.defaultClassCategory}`}
        >
          <label>
            Time format
            <select name="timeFormat" defaultValue={preferences.timeFormat}>
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </label>
          <label>
            Default class type
            <select name="defaultClassCategory" defaultValue={preferences.defaultClassCategory}>
              <option value="All">All classes</option>
              {classCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <p>The class schedule uses these preferences when you open it.</p>
          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
          <div className={styles.editActions}>
            <button disabled={pending}>{pending ? "Saving…" : "Save Preferences"}</button>
          </div>
        </form>
      )}
    </section>
  );
}
