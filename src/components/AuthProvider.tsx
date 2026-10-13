"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import type { Membership } from "@/types/membership";
import { isAuthProviderUnavailable, signInErrorMessage } from "@/lib/auth/errors";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  defaultPreferences,
  type Preferences,
  type Profile,
  type DemoOrder,
  type MembershipPlan,
} from "@/types/account";
import type { FitnessClass } from "@/types/fitness-class";

export type AccountUser = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  user: AccountUser | null;
  membership: Membership | null;
  membershipLoading: boolean;
  membershipError: string;
  isUserSignedIn: boolean;
  reservedClasses: FitnessClass[];
  isLoading: boolean;
  authError: string;
  retrySession: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (user: AccountUser, password: string, next: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendConfirmation: (email: string, next: string) => Promise<void>;
  updateProfile: (user: AccountUser) => Promise<boolean>;
  profileLoading: boolean;
  profileError: string;
  preferences: Preferences;
  updatePreferences: (preferences: Preferences) => Promise<void>;
  reservationsLoading: boolean;
  reservationsError: string;
  reservationsRevision: number;
  orders: DemoOrder[];
  ordersLoading: boolean;
  ordersError: string;
  retryAccount: () => void;
  reserveClass: (fitnessClass: FitnessClass) => Promise<void>;
  cancelReservation: (fitnessClass: FitnessClass) => Promise<void>;
  purchaseMembership: (plan: MembershipPlan, idempotencyKey: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [reservedClasses, setReservedClasses] = useState<FitnessClass[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState("");
  const [reservationsRevision, setReservationsRevision] = useState(0);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [accountAttempt, setAccountAttempt] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [sessionAttempt, setSessionAttempt] = useState(0);

  const userId = useRef<string | null>(null);
  const authRevision = useRef(0);

  function applyUser(authUser: User | null) {
    if (userId.current !== (authUser?.id ?? null)) {
      setMembership(null);
      setMembershipLoading(Boolean(authUser));
      setMembershipError("");
      setReservedClasses([]);
      setProfileLoading(Boolean(authUser));
      setProfileError("");
      setPreferences(defaultPreferences);
      setReservationsLoading(Boolean(authUser));
      setReservationsError("");
      setOrders([]);
      setOrdersLoading(Boolean(authUser));
      setOrdersError("");
      userId.current = authUser?.id ?? null;
    }
    const metadata = authUser?.user_metadata;
    setUser((current) =>
      authUser
        ? {
            id: authUser.id,
            firstName:
              current?.id === authUser.id
                ? current.firstName
                : typeof metadata?.first_name === "string"
                  ? metadata.first_name
                  : "Member",
            lastName:
              current?.id === authUser.id
                ? current.lastName
                : typeof metadata?.last_name === "string"
                  ? metadata.last_name
                  : "",
            email: authUser.email ?? "",
            phone:
              current?.id === authUser.id ? current.phone : typeof metadata?.phone === "string" ? metadata.phone : "",
          }
        : null,
    );
  }

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setAuthError("");
    let unsubscribe = () => {};
    try {
      const client = createClient();
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((event, session) => {
        // INITIAL_SESSION comes from storage; getUser must verify it first.
        if (!active || event === "INITIAL_SESSION") return;
        authRevision.current += 1;
        applyUser(session?.user ?? null);
        setIsLoading(false);
        setAuthError("");
        if (!session) {
          setMembership(null);
          setReservedClasses([]);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
      const revision = authRevision.current;
      client.auth
        .getUser()
        .then(({ data, error }) => {
          if (!active || revision !== authRevision.current) return;
          if (isAuthProviderUnavailable(error)) {
            setAuthError("Unable to check your session. Please try again.");
          } else {
            applyUser(error ? null : data.user);
          }
          setIsLoading(false);
        })
        .catch(() => {
          if (active && revision === authRevision.current) {
            setAuthError("Unable to check your session. Please try again.");
            setIsLoading(false);
          }
        });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in is unavailable.");
      setIsLoading(false);
    }
    return () => {
      active = false;
      unsubscribe();
    };
  }, [sessionAttempt]);

  const accountId = user?.id;
  useEffect(() => {
    if (!accountId) return;
    const controller = new AbortController();
    setMembershipLoading(true);
    setMembershipError("");
    fetch("/api/membership", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Unable to load your membership.");
        if (!controller.signal.aborted) setMembership(result.membership);
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setMembershipError(error instanceof Error ? error.message : "Unable to load your membership.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setMembershipLoading(false);
      });
    return () => controller.abort();
  }, [accountId, accountAttempt]);

  async function accountRequest<T>(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<T> {
    const response = await fetch(path, {
      method,
      cache: "no-store",
      signal,
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Unable to save or load your account. Please try again.");
    return result;
  }

  function applyProfile(profile: Profile) {
    if (profile.userId !== userId.current) return;
    setUser({
      id: profile.userId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    });
    setPreferences(profile.preferences);
  }

  useEffect(() => {
    if (!accountId) return;
    const controller = new AbortController();
    setProfileLoading(true);
    setProfileError("");
    setReservationsLoading(true);
    setReservationsError("");
    setOrdersLoading(true);
    setOrdersError("");
    void accountRequest<{ profile: Profile }>("/api/profile", "GET", undefined, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) applyProfile(result.profile);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setProfileError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setProfileLoading(false);
      });
    void accountRequest<{ reservations: FitnessClass[] }>("/api/reservations", "GET", undefined, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setReservedClasses(result.reservations);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setReservationsError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setReservationsLoading(false);
      });
    void accountRequest<{ orders: DemoOrder[] }>("/api/checkout", "GET", undefined, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setOrders(result.orders);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setOrdersError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setOrdersLoading(false);
      });
    return () => controller.abort();
  }, [accountId, accountAttempt]);

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Missing identity");
      authRevision.current += 1;
      applyUser(data.user);
      setIsLoading(false);
      setAuthError("");
    } catch (error) {
      throw new Error(signInErrorMessage(error));
    }
  }

  function emailCallback(next: string) {
    // Keep the redirect URL identical to the configured allow-list entry.
    // The destination cookie is navigation state only, never proof of authentication.
    document.cookie = `fm-auth-next=${encodeURIComponent(next)}; Path=/auth/callback; Max-Age=600; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
    return new URL("/auth/callback", window.location.origin).toString();
  }

  async function signUp(account: AccountUser, password: string, next: string) {
    const { data, error } = await createClient().auth.signUp({
      email: account.email,
      password,
      options: {
        emailRedirectTo: emailCallback(next),
        data: { first_name: account.firstName, last_name: account.lastName, phone: account.phone },
      },
    });
    if (error) throw new Error(error.message);
    if (data.session) applyUser(data.user);
    return Boolean(data.session);
  }

  async function requestPasswordReset(email: string) {
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: emailCallback("/auth/reset-password"),
    });
    if (error) throw new Error(error.message);
  }

  async function resendConfirmation(email: string, next: string) {
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: emailCallback(next) },
    });
    if (error) throw new Error(error.message);
  }

  async function updateProfile(account: AccountUser) {
    const client = createClient();
    const {
      data: { user: current },
      error: identityError,
    } = await client.auth.getUser();
    if (identityError || !current) throw new Error("Please log in again.");
    // Save profile fields first; email changes are confirmed separately by Supabase.
    const result = await accountRequest<{ profile: Profile }>("/api/profile", "PUT", {
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
    });
    applyProfile(result.profile);
    const emailChanged = account.email !== current.email;
    if (emailChanged) {
      const { error } = await client.auth.updateUser(
        { email: account.email },
        { emailRedirectTo: emailCallback("/profile") },
      );
      if (error) throw new Error(`Profile details saved, but the email change failed: ${error.message}`);
    }
    return emailChanged;
  }

  async function updatePreferences(values: Preferences) {
    const result = await accountRequest<{ profile: Profile }>("/api/preferences", "PUT", values);
    applyProfile(result.profile);
  }

  async function purchaseMembership(plan: MembershipPlan, idempotencyKey: string) {
    const identity = userId.current;
    const result = await accountRequest<{ membership: Membership | null; orders: DemoOrder[] }>(
      "/api/checkout",
      "POST",
      { plan, idempotencyKey },
    );
    if (identity !== userId.current) return;
    setMembership(result.membership);
    setOrders(result.orders);
    setOrdersError("");
  }

  async function changeReservation(fitnessClass: FitnessClass, method: "POST" | "DELETE") {
    const identity = userId.current;
    const result = await accountRequest<{ reservations: FitnessClass[] }>("/api/reservations", method, {
      classId: String(fitnessClass.id),
      date: fitnessClass.date,
    });
    if (identity !== userId.current) return;
    setReservedClasses(result.reservations);
    setReservationsError("");
    setReservationsRevision((current) => current + 1);
  }

  async function signOut() {
    const { error } = await createClient().auth.signOut({ scope: "local" });
    if (error) throw new Error("Unable to log out. Check your connection and try again.");
    authRevision.current += 1;
    applyUser(null);
    setIsLoading(false);
    setAuthError("");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        membership,
        membershipLoading,
        membershipError,
        isUserSignedIn: user !== null,
        reservedClasses,
        isLoading,
        authError,
        retrySession: () => setSessionAttempt((current) => current + 1),
        signIn,
        signUp,
        requestPasswordReset,
        resendConfirmation,
        updateProfile,
        profileLoading,
        profileError,
        preferences,
        updatePreferences,
        reservationsLoading,
        reservationsError,
        reservationsRevision,
        orders,
        ordersLoading,
        ordersError,
        retryAccount: () => setAccountAttempt((current) => current + 1),
        reserveClass: (fitnessClass) => changeReservation(fitnessClass, "POST"),
        cancelReservation: (fitnessClass) => changeReservation(fitnessClass, "DELETE"),
        purchaseMembership,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
