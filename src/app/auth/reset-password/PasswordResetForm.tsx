"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "@/app/profile/profile.module.css";

export default function PasswordResetForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const submitting = useRef(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password.length < 8 || password !== form.get("confirmation")) {
      setMessage("Use at least 8 characters and make sure the passwords match.");
      return;
    }
    submitting.current = true;
    setPending(true);
    setMessage("");
    try {
      const client = createClient();
      const {
        data: { user },
        error: identityError,
      } = await client.auth.getUser();
      if (identityError || !user) throw new Error("Your reset link has expired. Request a new link.");
      const { error } = await client.auth.updateUser({ password });
      if (error) throw new Error(error.message);
      router.replace("/profile");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your password. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <div className={styles.profilePage}>
      <section className={styles.loginCard} aria-labelledby="reset-title">
        <h1 id="reset-title">Choose a new password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">New password</label>
          <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          {message && <p role="alert">{message}</p>}
          <button className={styles.loginButton} type="submit" disabled={pending}>
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
