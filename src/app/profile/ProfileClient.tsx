"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { safeNextPath } from "@/lib/auth/redirect";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import type { FitnessClass } from "@/types/fitness-class";
import AccountPreferences from "./AccountPreferences";
import { formatClassTime } from "@/types/account";
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

export default function ProfileClient({ loginOnly = false }: { loginOnly?: boolean }) {
  const {
    user,
    membership,
    membershipLoading,
    membershipError,
    reservedClasses,
    signIn,
    signUp,
    requestPasswordReset,
    resendConfirmation,
    updateProfile,
    cancelReservation,
    signOut,
    isLoading,
    authError,
    retrySession,
    profileLoading,
    profileError,
    preferences,
    reservationsLoading,
    reservationsError,
    orders,
    ordersLoading,
    ordersError,
    retryAccount,
  } = useAuth();
  const [view, setView] = useState<"login" | "signup" | "recovery" | "confirmation">("login");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const [message, setMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [pendingUnenrollment, setPendingUnenrollment] = useState<FitnessClass | null>(null);
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

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("authError")) {
      setMessage("This email link is invalid or expired. Request a new link and open it in the same browser.");
    }
  }, []);

  useEffect(() => {
    if (loginOnly && user && !isLoading) {
      router.replace(safeNextPath(new URLSearchParams(window.location.search).get("next")));
      router.refresh();
    }
  }, [loginOnly, user, isLoading, router]);

  function getNext() {
    return safeNextPath(new URLSearchParams(window.location.search).get("next"));
  }

  async function submit(action: () => Promise<void>, report = setMessage) {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    report("");
    try {
      await action();
    } catch (error) {
      report(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void submit(async () => {
      await signIn(String(form.get("email") ?? "").trim(), String(form.get("password") ?? ""));
      router.replace(getNext());
      router.refresh();
    });
  }

  function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const account = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    };
    if (!account.firstName || !account.lastName || !account.email) {
      setMessage("Enter your first name, last name, and email address.");
      return;
    }
    const password = String(form.get("password") ?? "");
    if (password.length < 8 || !form.get("terms")) {
      setMessage("Use at least 8 characters and accept the terms to continue.");
      return;
    }
    void submit(async () => {
      const signedIn = await signUp(account, password, getNext());
      if (signedIn) {
        router.replace(getNext());
        router.refresh();
      } else
        setMessage(
          "Check your email for a confirmation link. Open it in this browser, then log in. If you already have an account, use Log In or reset your password.",
        );
    });
  }

  function handleRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    void submit(async () => {
      await requestPasswordReset(email);
      setMessage("If an account exists for that email, you will receive a reset link. Open it in this browser.");
    });
  }

  function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    void submit(async () => {
      await resendConfirmation(email, getNext());
      setMessage("If your account still needs confirmation, a new link will be sent. Open it in this browser.");
    });
  }

  function handleSignOut() {
    void submit(async () => {
      await signOut();
      setIsEditingProfile(false);
      setPendingUnenrollment(null);
      router.replace("/login");
      router.refresh();
    }, setProfileMessage);
  }

  function changeView(nextView: "login" | "signup" | "recovery" | "confirmation") {
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

    void submit(async () => {
      const emailChanged = await updateProfile(updatedUser);
      setIsEditingProfile(false);
      setProfileMessage(
        emailChanged
          ? "Profile updated. Check your email to confirm the email address change."
          : "Profile details updated.",
      );
      router.refresh();
    }, setProfileMessage);
  }

  if (isLoading)
    return (
      <p className={styles.demoNotice} role="status">
        Checking your session…
      </p>
    );

  if (loginOnly && user) return <p role="status">Returning to your page…</p>;

  if (user) {
    return (
      <div className={styles.accountPage}>
        <div className={styles.accountHeading}>
          <h1>Account Overview</h1>
          <button type="button" onClick={handleSignOut} disabled={pending}>
            Log Out
          </button>
        </div>

        {profileMessage && !isEditingProfile && <p role="status">{profileMessage}</p>}
        <div className={styles.accountGrid}>
          <section className={styles.accountCard} aria-labelledby="membership-status-title">
            <div className={styles.cardTitleRow}>
              <h2 id="membership-status-title">Membership Status</h2>
              <span className={membership?.status === "active" ? styles.activeStatus : undefined}>
                {membershipLoading
                  ? "Loading…"
                  : membershipError
                    ? "Unavailable"
                    : membership
                      ? membership.status === "active"
                        ? "Active"
                        : "Expired"
                      : "Not active"}
              </span>
            </div>
            {membershipError && (
              <p role="alert">
                {membershipError}{" "}
                <button type="button" onClick={retryAccount}>
                  Retry membership
                </button>
              </p>
            )}
            <dl>
              <div>
                <dt>Plan</dt>
                <dd>{membership ? `${membership.plan} (${membership.price})` : "Not selected"}</dd>
              </div>
              <div>
                <dt>Valid until</dt>
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
              {!isEditingProfile && !profileLoading && !profileError && (
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

            {profileLoading ? (
              <p role="status">Loading profile…</p>
            ) : profileError ? (
              <p role="alert">
                {profileError}{" "}
                <button type="button" onClick={retryAccount}>
                  Retry account data
                </button>
              </p>
            ) : isEditingProfile ? (
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
                  <button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
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
              </>
            )}
          </section>
        </div>

        <section className={styles.enrolledSection} aria-labelledby="enrolled-classes-title">
          <div className={styles.enrolledHeading}>
            <h2 id="enrolled-classes-title">Enrolled Classes</h2>
            <Link href="/classes">Browse Classes →</Link>
          </div>
          {reservationsLoading ? (
            <p role="status">Loading reservations…</p>
          ) : reservationsError ? (
            <p role="alert">
              {reservationsError}{" "}
              <button type="button" onClick={retryAccount}>
                Retry reservations
              </button>
            </p>
          ) : reservedClasses.length > 0 ? (
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
                    <tr key={`${fitnessClass.id}-${fitnessClass.date}`}>
                      <td>{fitnessClass.title}</td>
                      <td>{fitnessClass.coach}</td>
                      <td>{displayClassDate(fitnessClass.date)}</td>
                      <td>{formatClassTime(fitnessClass.time, preferences.timeFormat)}</td>
                      <td>{fitnessClass.room}</td>
                      <td>
                        <span>Enrolled</span>
                      </td>
                      <td>
                        <button
                          className={styles.unenrollButton}
                          type="button"
                          aria-label={`Unenroll from ${fitnessClass.title}`}
                          onClick={() => setPendingUnenrollment(fitnessClass)}
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
          {profileMessage && <p role="alert">{profileMessage}</p>}
          <div>
            <button type="button" disabled={pending} autoFocus onClick={() => setPendingUnenrollment(null)}>
              Keep Enrollment
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                void submit(async () => {
                  if (pendingUnenrollment) await cancelReservation(pendingUnenrollment);
                  setPendingUnenrollment(null);
                  setProfileMessage("Reservation canceled.");
                }, setProfileMessage);
              }}
            >
              Unenroll
            </button>
          </div>
        </dialog>

        <div className={styles.accountGrid}>
          <AccountPreferences />
          <section className={styles.accountCard} aria-labelledby="orders-title">
            <h2 id="orders-title">Demo Checkout History</h2>
            <p>No payments or automatic renewals are processed.</p>
            {ordersLoading ? (
              <p role="status">Loading checkout history…</p>
            ) : ordersError ? (
              <p role="alert">
                {ordersError} <button onClick={retryAccount}>Retry checkout history</button>
              </p>
            ) : orders.length ? (
              <ul>
                {orders.map((order) => (
                  <li key={order.id}>
                    {order.plan} — ${(order.amountCents / 100).toFixed(2)} simulated,{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" })}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No demo checkouts yet.</p>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <section className={styles.loginCard} aria-labelledby="profile-form-title">
        <h1 id="profile-form-title">
          {view === "login"
            ? "Log In to Your Account"
            : view === "recovery"
              ? "Reset Your Password"
              : view === "confirmation"
                ? "Confirm Your Email"
                : "Create Your Account"}
        </h1>
        <p>
          {view === "login"
            ? "Log in to view your membership, enrolled classes, and manage your profile."
            : view === "recovery"
              ? "Enter your email to receive a password reset link."
              : view === "confirmation"
                ? "Enter your email to request a new confirmation link."
                : "Create an account to manage your membership and reserve fitness classes."}
        </p>

        {authError && (
          <p role="alert">
            {authError}{" "}
            <button type="button" onClick={retrySession}>
              Retry session check
            </button>
          </p>
        )}
        {view === "recovery" || view === "confirmation" ? (
          <>
            <form onSubmit={view === "recovery" ? handleRecovery : handleResend}>
              <label htmlFor="recovery-email">Email</label>
              <input id="recovery-email" name="email" type="email" autoComplete="email" required />
              {message && (
                <p className={styles.status} role="alert">
                  {message}
                </p>
              )}
              <button className={styles.loginButton} type="submit" disabled={pending}>
                {pending ? "Sending…" : view === "recovery" ? "Send reset link" : "Resend confirmation"}
              </button>
            </form>
            <button
              className={styles.textButton}
              type="button"
              disabled={pending}
              onClick={() => changeView(view === "recovery" ? "login" : "signup")}
            >
              {view === "recovery" ? "Back to login" : "Back to create account"}
            </button>
          </>
        ) : view === "login" ? (
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
                <p className={styles.status} role="alert">
                  {message}
                </p>
              )}

              <button className={styles.loginButton} type="submit" disabled={pending}>
                {pending ? "Logging in…" : "Log In"}
              </button>
            </form>

            <button
              className={styles.textButton}
              type="button"
              disabled={pending}
              onClick={() => changeView("recovery")}
            >
              Forgot password?
            </button>

            <p className={styles.signup}>
              New here?{" "}
              <button type="button" disabled={pending} onClick={() => changeView("signup")}>
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
                <p className={styles.status} role="alert">
                  {message}
                </p>
              )}

              <button className={styles.loginButton} type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Create Account"}
              </button>
            </form>

            <button
              className={styles.textButton}
              type="button"
              disabled={pending}
              onClick={() => changeView("confirmation")}
            >
              Resend confirmation email
            </button>

            <p className={styles.signup}>
              Already have an account?{" "}
              <button type="button" disabled={pending} onClick={() => changeView("login")}>
                Log in
              </button>
            </p>
          </>
        )}
      </section>
    </div>
  );
}
