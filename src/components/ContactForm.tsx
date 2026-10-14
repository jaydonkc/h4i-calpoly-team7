"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { loginPath } from "@/lib/auth/redirect";
import { useState, type FormEvent } from "react";
import styles from "@/app/contact/contact.module.css";

export default function ContactForm() {
  const { isUserSignedIn, isLoading } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    setPending(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to save your message.");
      setMessage(result.message);
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save your message.");
    } finally {
      setPending(false);
    }
  }
  if (isLoading) return <p role="status">Checking your session…</p>;
  if (!isUserSignedIn)
    return (
      <p>
        <Link href={loginPath("/contact")}>Log in to leave a message</Link>. The front desk keeps messages here in the
        app.
      </p>
    );

  return (
    <form className={styles.form} onSubmit={handleSubmit} onChange={() => setMessage("")}>
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" name="name" placeholder="Your name" autoComplete="name" maxLength={120} required />

      <label htmlFor="contact-email">Email</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={254}
        required
      />

      <label htmlFor="contact-topic">Topic</label>
      <select id="contact-topic" name="topic" defaultValue="" required>
        <option value="" disabled>
          Select a topic
        </option>
        <option value="memberships">Memberships</option>
        <option value="classes">Classes</option>
        <option value="locations">Locations and hours</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="contact-message">Message</label>
      <textarea id="contact-message" name="message" placeholder="Your message..." rows={5} maxLength={3000} required />

      {message && (
        <p className={styles.formStatus} role="status">
          {message}
        </p>
      )}

      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Leave a Message"}
      </button>
    </form>
  );
}
