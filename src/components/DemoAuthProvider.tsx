"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { FitnessClass } from "@/types/fitness-class";

export type DemoUser = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type DemoMembership = {
  plan: string;
  price: string;
  renewalDate: string;
  memberId: string;
};

type DemoAuthContextValue = {
  user: DemoUser | null;
  membership: DemoMembership | null;
  isUserSignedIn: boolean;
  reservedClasses: FitnessClass[];
  createAccount: (user: DemoUser) => void;
  updateProfile: (user: DemoUser) => void;
  reserveClass: (fitnessClass: FitnessClass) => void;
  cancelReservation: (classId: FitnessClass["id"]) => void;
  purchaseMembership: (plan: string, price: string) => void;
  signOut: () => void;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [membership, setMembership] = useState<DemoMembership | null>(null);
  const [reservedClasses, setReservedClasses] = useState<FitnessClass[]>([]);

  function createAccount(account: DemoUser) {
    setUser(account);
    setMembership(null);
    setReservedClasses([]);
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
      renewalDate: localRenewalDate,
      memberId: current?.memberId ?? `FM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    }));
  }

  function reserveClass(fitnessClass: FitnessClass) {
    setReservedClasses((current) =>
      current.some((reservedClass) => reservedClass.id === fitnessClass.id) ? current : [...current, fitnessClass],
    );
  }

  function signOut() {
    setUser(null);
    setMembership(null);
    setReservedClasses([]);
  }

  return (
    <DemoAuthContext.Provider
      value={{
        user,
        membership,
        isUserSignedIn: user !== null,
        reservedClasses,
        createAccount,
        updateProfile: setUser,
        reserveClass,
        cancelReservation: (classId) =>
          setReservedClasses((current) => current.filter((fitnessClass) => fitnessClass.id !== classId)),
        purchaseMembership,
        signOut,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);

  if (!context) {
    throw new Error("useDemoAuth must be used inside DemoAuthProvider.");
  }

  return context;
}
