import "../globals.css";

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
    price: "$29/mo",
    description: "Access to a spa or smth.",
    perks: ["perk1", "perk2", "perk3"],
  },
];

export default function MembershipsPage() {
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

              <button className="tierButton">Select {tier.name}</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
