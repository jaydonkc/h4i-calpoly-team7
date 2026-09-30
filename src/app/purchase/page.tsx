"use client";

import "../globals.css";
import "./purchase.css";
import { useEffect, useRef, useState } from "react";

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

export default function MembershipsPage() {
  // adds button functionality
  const [selectedTier, setSelectedTier] = useState<(typeof tiers)[number] | null>(null);
  // disables background click
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selectedTier) dialogRef.current?.showModal();
  }, [selectedTier]);
  return (
    <main>
      <section>
        <div className="membershipBanner">
          <p>Start working out</p>
          <h1>Memberships</h1>
        </div>
      </section>

      <section>
        <div className="planChoice">
          <h2>Choose your plan</h2>
          <p>Flexible options for all.</p>
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

              <button className="tierButton" onClick={() => setSelectedTier(tier)}>
                Select {tier.name}
              </button>
            </article>
          ))}
        </div>
      </section>
      {/* haven't had the chance to really run through how this form works but its fairly simple*/}
      {selectedTier && (
        <dialog ref={dialogRef} className="paymentForm" onClose={() => setSelectedTier(null)}>
          <h2>Purchase {selectedTier.name}</h2>

          <div>
            <h3>Billing summary</h3>
            <p>{selectedTier.name} membership</p>
            <p>{selectedTier.description}</p>
            <p>Total: {selectedTier.price}</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Mock purchase complete. No payment was processed.");
              setSelectedTier(null);
            }}
          >
            <h3>Card details</h3>
            <label>
              Card number <input type="password" maxLength={19} required />
            </label>
            <label>
              Expiry <input placeholder="MM/YY" maxLength={5} required />
            </label>
            <label>
              CVC <input required maxLength={4} size={4} />
            </label>

            <h3>Billing address</h3>
            <label>
              Street <input required />
            </label>
            <label>
              City <input required />
            </label>
            <label>
              State <input required />
            </label>
            <label>
              ZIP <input required />
            </label>

            <button type="submit">Pay {selectedTier.price}</button>
            <button type="button" onClick={() => setSelectedTier(null)}>
              Cancel
            </button>
          </form>
        </dialog>
      )}
    </main>
  );
}
