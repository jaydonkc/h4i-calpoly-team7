"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";

import type { MembershipPlan } from "@/types/account";

const tiers: Array<{ name: MembershipPlan; price: string; description: string; perks: string[] }> = [
  {
    name: "Student",
    price: "$10/mo",
    description: "Student membership for gym.",
    perks: ["perk1", "perk2", "perk3"],
  },
  {
    name: "Standard",
    price: "$15/mo",
    description: "Standard Membership.",
    perks: ["perk1", "perk2", "perk3"],
  },
  {
    name: "Premium",
    price: "$30/mo",
    description: "Access to a spa or smth.",
    perks: ["perk1", "perk2", "perk3"],
  },
];

export default function MembershipPlans() {
  const { isUserSignedIn, purchaseMembership } = useAuth();
  // adds button functionality
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
          <p>Demo checkout saves your selection. No payment or automatic renewal will be processed.</p>
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
                onClick={() => {
                  if (!isUserSignedIn) {
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

      <dialog ref={loginPromptRef} className="loginPrompt" aria-labelledby="membership-login-title">
        <h2 id="membership-login-title">Log in to select a membership</h2>
        <p>You need to log in or create an account before purchasing a membership.</p>
        <div>
          <button type="button" onClick={() => loginPromptRef.current?.close()}>
            Not Now
          </button>
          <Link href="/profile">Continue to Log In</Link>
        </div>
      </dialog>

      {selectedTier && (
        <dialog
          ref={dialogRef}
          className="paymentForm"
          aria-labelledby="purchase-dialog-title"
          onClose={() => setSelectedTier(null)}
        >
          <h2 id="purchase-dialog-title">Demo checkout: {selectedTier.name}</h2>

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
                setPurchaseSuccess(`Demo ${selectedTier.name} checkout saved. No payment was processed.`);
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
            <p>This is a simulated checkout. No card or billing details are needed.</p>

            {paymentError && <p role="alert">{paymentError}</p>}

            <button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Confirm Demo Checkout"}
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
        onClose={() => setConfirmedPlan("")}
      >
        <h2 id="purchase-confirmation-title">Demo checkout saved</h2>
        <p>
          Your {confirmedPlan} demo selection is saved in your checkout history. View your account for your current
          membership status. No payment was processed.
        </p>
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
