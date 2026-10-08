import Link from "next/link";
import { gymLocations } from "@/data/site-content";
import styles from "./home.module.css";

type FeatureIcon = "equipment" | "classes" | "location" | "coach";

const features: Array<{ icon: FeatureIcon; title: string; description: string }> = [
  { icon: "equipment", title: "Modern Equipment", description: "Free weights, cardio, and more" },
  { icon: "classes", title: "Group Classes", description: "A variety of classes every week" },
  { icon: "location", title: "Multiple Locations", description: "Convenient gyms across the city" },
  { icon: "coach", title: "Expert Coaches", description: "Support for all fitness levels" },
];

function FeatureIcon({ name }: { name: FeatureIcon }) {
  const paths = {
    equipment: (
      <>
        <path d="M4 9v6M7 6v12M17 6v12M20 9v6M7 12h10M2 10v4M22 10v4" />
      </>
    ),
    classes: (
      <>
        <circle cx="12" cy="7" r="3" />
        <circle cx="5" cy="10" r="2" />
        <circle cx="19" cy="10" r="2" />
        <path d="M7 20v-2a5 5 0 0 1 10 0v2M1.5 19v-1a3.5 3.5 0 0 1 5-3.2M22.5 19v-1a3.5 3.5 0 0 0-5-3.2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    coach: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2H5Z" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-title">
        <h1 id="home-title">FitnessMaxxing</h1>
        <p>Quality equipment, expert coaches, and a welcoming community to help you stay consistent.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/purchase">
            View Membership Plans
          </Link>
          <Link className={styles.secondaryButton} href="/gym-info">
            Learn More
          </Link>
        </div>
      </section>

      <section className={styles.features} aria-label="Gym highlights">
        {features.map((feature) => (
          <article key={feature.title}>
            <FeatureIcon name={feature.icon} />
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className={styles.locations} aria-labelledby="locations-title">
        <div className={styles.sectionHeading}>
          <h2 id="locations-title">Gym Locations</h2>
          <Link href="/gym-info">View All →</Link>
        </div>

        <div className={styles.locationGrid}>
          {gymLocations.map((location) => (
            <article key={location.name}>
              <div>
                <h3>{location.name}</h3>
                <address>{location.region}</address>
              </div>
              <Link href="/gym-info" aria-label={`Learn more about the ${location.name} location`}>
                →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
