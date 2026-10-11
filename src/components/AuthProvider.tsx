"use client";

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import type { Membership } from "@/types/membership";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (user: AccountUser, password: string, next: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendConfirmation: (email: string, next: string) => Promise<void>;
  updateProfile: (user: AccountUser) => Promise<boolean>;
  reserveClass: (fitnessClass: FitnessClass) => void;
  cancelReservation: (classId: FitnessClass["id"]) => void;
  purchaseMembership: (plan: string, price: string) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState("");
  const [reservedClasses, setReservedClasses] = useState<FitnessClass[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const userId = useRef<string | null>(null);
  const authRevision = useRef(0);

  function applyUser(authUser: User | null) {
    if (userId.current !== (authUser?.id ?? null)) {
      setMembership(null);
      setMembershipLoading(Boolean(authUser));
      setMembershipError("");
      setReservedClasses([]);
      userId.current = authUser?.id ?? null;
    }
    const metadata = authUser?.user_metadata;
    setUser(
      authUser
        ? {
            id: authUser.id,
            firstName: typeof metadata?.first_name === "string" ? metadata.first_name : "Member",
            lastName: typeof metadata?.last_name === "string" ? metadata.last_name : "",
            email: authUser.email ?? "",
            phone: typeof metadata?.phone === "string" ? metadata.phone : "",
          }
        : null,
    );
  }

  useEffect(() => {
    let active = true;
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
          applyUser(error ? null : data.user);
          setIsLoading(false);
        })
        .catch(() => {
          if (active) {
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
  }, []);

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
  }, [accountId]);

  async function signIn(email: string, password: string) {
    const { data, error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    applyUser(data.user);
    setAuthError("");
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
    const emailChanged = account.email !== current.email;
    const { data, error } = await client.auth.updateUser(
      {
        ...(emailChanged ? { email: account.email } : {}),
        data: { first_name: account.firstName, last_name: account.lastName, phone: account.phone },
      },
      { emailRedirectTo: emailCallback("/profile") },
    );
    if (error) throw new Error(error.message);
    applyUser(data.user);
    return emailChanged;
  }

  function purchaseMembership(plan: string, price: string) {
    const paidOn = new Date();
    const renewalMonth = paidOn.getMonth() + 1;
    const lastDayOfRenewalMonth = new Date(paidOn.getFullYear(), renewalMonth + 1, 0).getDate();
    const renewalDate = new Date(paidOn.getFullYear(), renewalMonth, Math.min(paidOn.getDate(), lastDayOfRenewalMonth));
    const localRenewalDate = [
      renewalDate.getFullYear(),
      String(renewalDate.getMonth() + 1).padStart(2, "0"),
      String(renewalDate.getDate()).padStart(2, "0"),
    ].join("-");

    setMembership((current) => ({
      plan,
      price,
      status: "active",
      source: "demo_checkout",
      renewalDate: localRenewalDate,
      memberId: current?.memberId ?? `FM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    }));
  }

  function reserveClass(fitnessClass: FitnessClass) {
    setReservedClasses((current) =>
      current.some((reservedClass) => reservedClass.id === fitnessClass.id) ? current : [...current, fitnessClass],
    );
  }

  async function signOut() {
    const { error } = await createClient().auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
    setMembership(null);
    setReservedClasses([]);
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
        signIn,
        signUp,
        requestPasswordReset,
        resendConfirmation,
        updateProfile,
        reserveClass,
        cancelReservation: (classId) =>
          setReservedClasses((current) => current.filter((fitnessClass) => fitnessClass.id !== classId)),
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
