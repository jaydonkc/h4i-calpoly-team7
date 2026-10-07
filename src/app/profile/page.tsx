"use client";

import { useState, type FormEvent } from "react";
import styles from "./profile.module.css";

export default function Profile() {
  const [message, setMessage] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login is not connected yet. Your information was not submitted.");
  }

  return (
    <div className={styles.profilePage}>
      <section className={styles.loginCard} aria-labelledby="login-title">
        <h1 id="login-title">Log In to Your Account</h1>
        <p>Log in to view your membership, enrolled classes, and manage your profile.</p>

        <form onSubmit={handleLogin} onChange={() => setMessage("")}>
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="profile-password">Password</label>
          <input
            id="profile-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {message && (
            <p className={styles.status} role="status">
              {message}
            </p>
          )}

          <button className={styles.loginButton} type="submit">
            Log In
          </button>
        </form>

        <button
          className={styles.textButton}
          type="button"
          onClick={() => setMessage("Password recovery is not available yet.")}
        >
          Forgot password?
        </button>

        <p className={styles.signup}>
          New here?{" "}
          <button type="button" onClick={() => setMessage("Account creation is not available yet.")}>
            Create an account
          </button>
        </p>
      </section>
    </div>
  );
}
