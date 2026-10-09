"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import type { FitnessClass } from "@/types/fitness-class";
import styles from "./profile.module.css";

function displayClassDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function displayMembershipDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, membership, reservedClasses, createAccount, updateProfile, cancelReservation, signOut } = useDemoAuth();
  const [view, setView] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [pendingUnenrollment, setPendingUnenrollment] = useState<{ id: FitnessClass["id"]; title: string } | null>(
    null,
  );
  const unenrollDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = unenrollDialogRef.current;
    if (!dialog) return;

    if (pendingUnenrollment && !dialog.open) {
      dialog.showModal();
    } else if (!pendingUnenrollment && dialog.open) {
      dialog.close();
    }
  }, [pendingUnenrollment]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Login is not connected yet. Your information was not submitted.");
  }

  function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const account = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };

    if (!account.firstName || !account.lastName || !account.email) {
      setMessage("Enter your first name, last name, and email address.");
      return;
    }

    createAccount(account);
  }

  function changeView(nextView: "login" | "signup") {
    setView(nextView);
    setMessage("");
  }

  function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedUser = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    };

    if (!updatedUser.firstName || !updatedUser.lastName || !updatedUser.email) {
      setProfileMessage("First name, last name, and email are required.");
      return;
    }

    updateProfile(updatedUser);
    setIsEditingProfile(false);
    setProfileMessage("Profile details updated.");
  }

  if (user) {
    return (
      <div className={styles.accountPage}>
        <div className={styles.accountHeading}>
          <h1>Account Overview</h1>
          <button type="button" onClick={signOut}>
            Log Out
          </button>
        </div>

        <div className={styles.accountGrid}>
          <section className={styles.accountCard} aria-labelledby="membership-status-title">
            <div className={styles.cardTitleRow}>
              <h2 id="membership-status-title">Membership Status</h2>
              <span className={membership ? styles.activeStatus : undefined}>
                {membership ? "Active" : "Not active"}
              </span>
            </div>
            <dl>
              <div>
                <dt>Plan</dt>
                <dd>{membership ? `${membership.plan} (${membership.price})` : "Not selected"}</dd>
              </div>
              <div>
                <dt>Renewal date</dt>
                <dd>{membership ? displayMembershipDate(membership.renewalDate) : "Not scheduled"}</dd>
              </div>
              {membership && (
                <div>
                  <dt>Member ID</dt>
                  <dd>{membership.memberId}</dd>
                </div>
              )}
            </dl>
            {membership ? (
              <button className={styles.accountAction} type="button" disabled title="Digital barcode coming soon">
                View Barcode
              </button>
            ) : (
              <Link className={styles.accountAction} href="/purchase">
                View Memberships
              </Link>
            )}
          </section>

          <section className={styles.accountCard} aria-labelledby="profile-details-title">
            <div className={styles.cardTitleRow}>
              <h2 id="profile-details-title">Profile Details</h2>
              {!isEditingProfile && (
                <button
                  className={styles.editButton}
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(true);
                    setProfileMessage("");
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form className={styles.editForm} onSubmit={handleProfileUpdate}>
                <div className={styles.editNameRow}>
                  <label>
                    First name
                    <input name="firstName" defaultValue={user.firstName} autoComplete="given-name" required />
                  </label>
                  <label>
                    Last name
                    <input name="lastName" defaultValue={user.lastName} autoComplete="family-name" required />
                  </label>
                </div>
                <label>
                  Email
                  <input name="email" type="email" defaultValue={user.email} autoComplete="email" required />
                </label>
                <label>
                  Phone number <span className={styles.optional}>(optional)</span>
                  <input name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" />
                </label>
                {profileMessage && <p role="alert">{profileMessage}</p>}
                <div className={styles.editActions}>
                  <button type="submit">Save Changes</button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileMessage("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl>
                  <div>
                    <dt>Name</dt>
                    <dd>
                      {user.firstName} {user.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>{user.phone || "Not provided"}</dd>
                  </div>
                </dl>
                {profileMessage && (
                  <p className={styles.profileStatus} role="status">
                    {profileMessage}
                  </p>
                )}
              </>
            )}
          </section>
        </div>

        <section className={styles.enrolledSection} aria-labelledby="enrolled-classes-title">
          <div className={styles.enrolledHeading}>
            <h2 id="enrolled-classes-title">Enrolled Classes</h2>
            <Link href="/classes">Browse Classes →</Link>
          </div>
          {reservedClasses.length > 0 ? (
            <div className={styles.enrolledTableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Class</th>
                    <th scope="col">Instructor</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Location</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className={styles.visuallyHidden}>Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservedClasses.map((fitnessClass) => (
                    <tr key={fitnessClass.id}>
                      <td>{fitnessClass.title}</td>
                      <td>{fitnessClass.coach}</td>
                      <td>{displayClassDate(fitnessClass.date)}</td>
                      <td>{fitnessClass.time}</td>
                      <td>{fitnessClass.room}</td>
                      <td>
                        <span>Enrolled</span>
                      </td>
                      <td>
                        <button
                          className={styles.unenrollButton}
                          type="button"
                          aria-label={`Unenroll from ${fitnessClass.title}`}
                          onClick={() => setPendingUnenrollment({ id: fitnessClass.id, title: fitnessClass.title })}
                        >
                          Unenroll
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyClasses}>
              <h3>No classes reserved yet</h3>
              <p>Your reserved classes will appear here.</p>
            </div>
          )}
        </section>

        <dialog
          ref={unenrollDialogRef}
          className={styles.unenrollDialog}
          aria-labelledby="unenroll-dialog-title"
          onClose={() => setPendingUnenrollment(null)}
        >
          <h2 id="unenroll-dialog-title">Unenroll from this class?</h2>
          <p>
            {pendingUnenrollment
              ? `Are you sure you want to unenroll from ${pendingUnenrollment.title}?`
              : "Are you sure you want to unenroll?"}
          </p>
          <div>
            <button type="button" autoFocus onClick={() => setPendingUnenrollment(null)}>
              Keep Enrollment
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingUnenrollment) cancelReservation(pendingUnenrollment.id);
                setPendingUnenrollment(null);
              }}
            >
              Unenroll
            </button>
          </div>
        </dialog>

        <p className={styles.demoNotice}>This is a temporary demo session. Account details are not saved.</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <section className={styles.loginCard} aria-labelledby="profile-form-title">
        <h1 id="profile-form-title">{view === "login" ? "Log In to Your Account" : "Create Your Account"}</h1>
        <p>
          {view === "login"
            ? "Log in to view your membership, enrolled classes, and manage your profile."
            : "Create an account to manage your membership and reserve fitness classes."}
        </p>

        {view === "login" ? (
          <>
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
              <button type="button" onClick={() => changeView("signup")}>
                Create an account
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleCreateAccount} onChange={() => setMessage("")}>
              <div className={styles.nameRow}>
                <div className={styles.field}>
                  <label htmlFor="signup-first-name">First name</label>
                  <input id="signup-first-name" name="firstName" type="text" autoComplete="given-name" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="signup-last-name">Last name</label>
                  <input id="signup-last-name" name="lastName" type="text" autoComplete="family-name" required />
                </div>
              </div>

              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <label htmlFor="signup-phone">
                Phone number <span className={styles.optional}>(optional)</span>
              </label>
              <input id="signup-phone" name="phone" type="tel" placeholder="(805) 555-0147" autoComplete="tel" />

              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <label className={styles.terms} htmlFor="signup-terms">
                <input id="signup-terms" name="terms" type="checkbox" required />
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>

              {message && (
                <p className={styles.status} role="status">
                  {message}
                </p>
              )}

              <button className={styles.loginButton} type="submit">
                Create Account
              </button>
            </form>

            <p className={styles.signup}>
              Already have an account?{" "}
              <button type="button" onClick={() => changeView("login")}>
                Log in
              </button>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
