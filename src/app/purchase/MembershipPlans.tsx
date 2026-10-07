"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDemoAuth } from "@/components/DemoAuthProvider";

const tiers = [
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
  const { isUserSignedIn, purchaseMembership } = useDemoAuth();
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
          <p>Demo checkout: use sample details. No payment will be processed.</p>
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
          <h2 id="purchase-dialog-title">Purchase {selectedTier.name}</h2>

          <div>
            <h3>Billing summary</h3>
            <p>{selectedTier.name} membership</p>
            <p>{selectedTier.description}</p>
            <p>Total: {selectedTier.price}</p>
          </div>

          <form
            onChange={() => setPaymentError("")}
            onSubmit={(event) => {
              event.preventDefault();
              const values = new FormData(event.currentTarget);
              const cardNumber = String(values.get("cardNumber"));
              const expiry = String(values.get("expiry"));
              const [month, year] = expiry.split("/").map(Number);
              const now = new Date();
              if (
                !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry) ||
                2000 + year < now.getFullYear() ||
                (2000 + year === now.getFullYear() && month < now.getMonth() + 1)
              ) {
                setPaymentError("Enter a valid expiry date that has not passed.");
                return;
              }
              if (cardNumber.endsWith("67")) {
                setPaymentError("Your card was declined.");
                return;
              }
              setPaymentError("");
              purchaseMembership(selectedTier.name, selectedTier.price);
              setPurchaseSuccess(`Mock ${selectedTier.name} purchase successful. No payment was processed.`);
              setConfirmedPlan(selectedTier.name);
              setSelectedTier(null);
            }}
          >
            <h3>Card details</h3>
            <label>
              Card number
              <input
                name="cardNumber"
                type="password"
                inputMode="numeric"
                maxLength={16}
                pattern="[0-9]{16}"
                title="Enter 16 digits"
                required
              />
            </label>

            <label>
              Expiry
              <input
                name="expiry"
                placeholder="MM/YY"
                pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                title="Enter in MM/YY format"
                maxLength={5}
                required
              />
            </label>

            <label>
              CVC <input pattern="[0-9]{3}|[0-9]{4}" maxLength={4} required />
            </label>

            <h3>Billing address</h3>
            <label>
              Street <input required />
            </label>
            <label>
              City <input pattern="[^0-9]+" title="No numbers permitted" required />
            </label>
            <label>
              State <input pattern="[^0-9]+" title="No numbers permitted" required />
            </label>
            <label>
              ZIP <input pattern="[0-9]{5}" maxLength={5} required />
            </label>

            {paymentError && <p role="alert">{paymentError}</p>}

            <button type="submit">Pay {selectedTier.price}</button>
            <button type="button" onClick={() => setSelectedTier(null)}>
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
        <h2 id="purchase-confirmation-title">Membership confirmed</h2>
        <p>Your {confirmedPlan} membership is now active. You can view your membership details from your account.</p>
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
