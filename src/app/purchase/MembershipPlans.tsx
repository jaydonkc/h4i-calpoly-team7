"use client";

import { loginPath } from "@/lib/auth/redirect";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

import type { MembershipPlan } from "@/types/account";

const tiers: Array<{ name: MembershipPlan; price: string; description: string; perks: string[] }> = [
  {
    name: "Student",
    price: "$10/mo",
    description: "For study breaks that turn into personal bests.",
    perks: ["Every gym location", "Every scheduled group class", "A study break with actual movement"],
  },
  {
    name: "Standard",
    price: "$15/mo",
    description: "Your everyday training arc starts here.",
    perks: ["Every gym location", "Every scheduled group class", "A routine worth showing up for"],
  },
  {
    name: "Premium",
    price: "$30/mo",
    description: "Same great gym. Maximum main-character energy.",
    perks: ["Every gym location", "Every scheduled group class", "Premium bragging rights on your member card"],
  },
];

export default function MembershipPlans() {
  const { isUserSignedIn, isLoading, purchaseMembership } = useAuth();
  // adds button functionality
  const [loginTier, setLoginTier] = useState<MembershipPlan | null>(null);
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number] | null>(null);
  // disables background click
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loginPromptRef = useRef<HTMLDialogElement>(null);
  const confirmationRef = useRef<HTMLDialogElement>(null);
  // payment error react element
  const [paymentError, setPaymentError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const [confirmedPlan, setConfirmedPlan] = useState("");
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const checkoutKey = useRef("");
  const selectionTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isUserSignedIn) return;
    const name = new URLSearchParams(window.location.search).get("plan");
    const tier = tiers.find((item) => item.name === name);
    if (tier) {
      checkoutKey.current = crypto.randomUUID();
      setSelectedTier(tier);
    }
  }, [isUserSignedIn]);

  useEffect(() => {
    if (selectedTier) dialogRef.current?.showModal();
  }, [selectedTier]);

  useEffect(() => {
    if (confirmedPlan && !confirmationRef.current?.open) {
      confirmationRef.current?.showModal();
    }
  }, [confirmedPlan]);

  return (
    <>
      <section>
        <div className="membershipBanner">
          <h1>Memberships</h1>
          <p>Start working out</p>
        </div>
      </section>

      <section>
        <div className="planChoice">
          <h2>Choose your plan</h2>
          <p>Flexible options for all.</p>
          <p>Choose a plan to get started.</p>
          <p role="status">{purchaseSuccess}</p>
        </div>

        <div className="planTier">
          {tiers.map((tier) => (
            <article key={tier.name}>
              <h3 className="tierName">{tier.name}</h3>
              <div className="tierPrice">{tier.price}</div>
              <p className="tierDescription">{tier.description}</p>

              <ul>
                {tier.perks.map((perk, index) => (
                  <li key={tier.name + index}>{perk}</li>
                ))}
              </ul>

              <button
                className="tierButton"
                disabled={pending || isLoading}
                onClick={(event) => {
                  selectionTrigger.current = event.currentTarget;
                  if (!isUserSignedIn) {
                    setLoginTier(tier.name);
                    loginPromptRef.current?.showModal();
                    return;
                  }

                  setPaymentError("");
                  setPurchaseSuccess("");
                  checkoutKey.current = crypto.randomUUID();
                  setSelectedTier(tier);
                }}
              >
                Select {tier.name}
              </button>
            </article>
          ))}
        </div>
      </section>

      <dialog
        ref={loginPromptRef}
        className="loginPrompt"
        aria-labelledby="membership-login-title"
        onClose={() => {
          setLoginTier(null);
          selectionTrigger.current?.focus();
        }}
      >
        <h2 id="membership-login-title">Log in to select a membership</h2>
        <p>You need to log in or create an account before purchasing a membership.</p>
        <div>
          <button type="button" onClick={() => loginPromptRef.current?.close()}>
            Not Now
          </button>
          <Link href={loginPath(`/purchase?plan=${loginTier ?? "Standard"}`)}>Continue to Log In</Link>
        </div>
      </dialog>

      {selectedTier && (
        <dialog
          ref={dialogRef}
          className="paymentForm"
          aria-labelledby="purchase-dialog-title"
          onCancel={(event) => {
            if (pending) event.preventDefault();
          }}
          onClose={() => {
            setSelectedTier(null);
            selectionTrigger.current?.focus();
          }}
        >
          <h2 id="purchase-dialog-title">Select your membership: {selectedTier.name}</h2>

          <div>
            <h3>Billing summary</h3>
            <p>{selectedTier.name} membership</p>
            <p>{selectedTier.description}</p>
            <p>Total: {selectedTier.price}</p>
          </div>

          <form
            onChange={() => setPaymentError("")}
            onSubmit={async (event) => {
              event.preventDefault();
              if (busy.current) return;
              busy.current = true;
              setPending(true);
              setPaymentError("");
              try {
                await purchaseMembership(selectedTier.name, checkoutKey.current);
                setPurchaseSuccess(`${selectedTier.name} membership saved.`);
                setConfirmedPlan(selectedTier.name);
                setSelectedTier(null);
              } catch (error) {
                setPaymentError(error instanceof Error ? error.message : "Unable to save checkout. Please try again.");
              } finally {
                busy.current = false;
                setPending(false);
              }
            }}
          >
            <p>No payment will be taken. No card details are needed.</p>

            {paymentError && <p role="alert">{paymentError}</p>}

            <button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Confirm Membership"}
            </button>
            <button type="button" disabled={pending} onClick={() => setSelectedTier(null)}>
              Cancel
            </button>
          </form>
        </dialog>
      )}

      <dialog
        ref={confirmationRef}
        className="purchaseConfirmation"
        aria-labelledby="purchase-confirmation-title"
        onClose={() => {
          setConfirmedPlan("");
          selectionTrigger.current?.focus();
        }}
      >
        <h2 id="purchase-confirmation-title">Membership saved</h2>
        <p>Your {confirmedPlan} membership is saved. View your account for your membership details and history.</p>
        <div>
          <button type="button" onClick={() => confirmationRef.current?.close()}>
            Close
          </button>
          <Link href="/profile">View My Account</Link>
        </div>
      </dialog>
    </>
  );
}
