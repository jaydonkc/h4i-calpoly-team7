"use client";

import { useState, type FormEvent } from "react";
import styles from "@/app/contact/contact.module.css";

export default function ContactForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("This demo form is not connected to a messaging service yet. Please use the email or phone number.");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} onChange={() => setMessage("")}>
      <label htmlFor="contact-name">Name</label>
      <input id="contact-name" name="name" placeholder="Your name" autoComplete="name" required />

      <label htmlFor="contact-email">Email</label>
      <input id="contact-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />

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
      <textarea id="contact-message" name="message" placeholder="Your message..." rows={5} required />

      {message && (
        <p className={styles.formStatus} role="status">
          {message}
        </p>
      )}

      <button type="submit">Send Message</button>
    </form>
  );
}
