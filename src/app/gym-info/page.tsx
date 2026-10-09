import Link from "next/link";
import { gymLocations } from "@/data/site-content";
import { classRepository } from "@/lib/classes/class-repository";
import type { ClassCategory } from "@/types/fitness-class";
import "./info.css";

export const dynamic = "force-dynamic";

type AmenityIconName = "weights" | "cardio" | "group" | "locker" | "shower" | "parking" | "storage" | "wifi";

const amenities: Array<{ name: string; icon: AmenityIconName }> = [
  { name: "Free Weights", icon: "weights" },
  { name: "Cardio Equipment", icon: "cardio" },
  { name: "Group Fitness Studios", icon: "group" },
  { name: "Locker Rooms", icon: "locker" },
  { name: "Showers", icon: "shower" },
  { name: "Parking", icon: "parking" },
  { name: "Lockers", icon: "storage" },
  { name: "Wi-Fi", icon: "wifi" },
];

function AmenityIcon({ name }: { name: AmenityIconName }) {
  const paths = {
    weights: <path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12M1 10v4M23 10v4" />,
    cardio: <path d="M3 13h4l2-5 4 9 2-5h6" />,
    group: (
      <>
        <circle cx="12" cy="7" r="3" />
        <circle cx="5" cy="10" r="2" />
        <circle cx="19" cy="10" r="2" />
        <path d="M7 20v-2a5 5 0 0 1 10 0v2M1.5 19v-1a3.5 3.5 0 0 1 5-3.2M22.5 19v-1a3.5 3.5 0 0 0-5-3.2" />
      </>
    ),
    locker: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="1" />
        <path d="M9 4V2h6v2M9 9h6M9 13h6M15 17h.01" />
      </>
    ),
    shower: (
      <>
        <path d="M5 11a7 7 0 0 1 14 0M5 11h14" />
        <path d="M8 15v1M12 15v2M16 15v1M6 19v1M10 20v1M14 19v1M18 20v1" />
      </>
    ),
    parking: <path d="M7 21V3h6a5 5 0 0 1 0 10H7M7 13h6" />,
    storage: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="1" />
        <path d="M5 10h14M10 3v18M14 3v18M7.5 7h.01M16.5 14h.01" />
      </>
    ),
    wifi: (
      <>
        <path d="M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0M9.5 16a4 4 0 0 1 5 0" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

export default async function GymInfoPage() {
  const coachCategories = new Map<string, Set<ClassCategory>>();

  try {
    const schedule = await classRepository.getSchedule();
    schedule.classes.forEach((fitnessClass) => {
      const categories = coachCategories.get(fitnessClass.coach) ?? new Set<ClassCategory>();
      categories.add(fitnessClass.category);
      coachCategories.set(fitnessClass.coach, categories);
    });
  } catch {
    // The rest of the About page remains available if class data cannot load.
  }

  const coaches = Array.from(coachCategories, ([name, categories]) => ({
    name,
    specialties: Array.from(categories).join(" & "),
  }));

  return (
    <div className="about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <h1 id="about-title">About Us</h1>
        <p>
          FitnessMaxxing is a community-focused gym with quality equipment, experienced coaches, and a variety of
          classes for every fitness journey.
        </p>
      </section>

      <section className="about-section" aria-labelledby="coaches-title">
        <div className="about-section-heading">
          <h2 id="coaches-title">Our Coaches</h2>
          <Link href="/classes">View Classes →</Link>
        </div>

        {coaches.length > 0 ? (
          <div className="coach-grid">
            {coaches.map((coach) => (
              <article key={coach.name}>
                <div className="card-heading">
                  <div>
                    <h3>{coach.name}</h3>
                    <p>{coach.specialties}</p>
                  </div>
                </div>
                <p>
                  Specializes in {coach.specialties.toLowerCase()} sessions and helps members train with confidence and
                  consistency.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="about-notice">Coach information is temporarily unavailable.</p>
        )}
      </section>

      <section className="about-section" aria-labelledby="about-locations-title">
        <div className="about-section-heading">
          <h2 id="about-locations-title">Locations &amp; Hours</h2>
          <Link href="/contact">Contact Us →</Link>
        </div>

        <div className="about-location-grid">
          {gymLocations.map((location) => (
            <article key={location.name}>
              <h3>{location.name}</h3>
              <address>{location.region}</address>
              <p>Address and hours pending partner review.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section amenities-section" aria-labelledby="amenities-title">
        <h2 id="amenities-title">Amenities</h2>
        <div className="amenities-grid">
          {amenities.map((amenity) => (
            <div key={amenity.name}>
              <AmenityIcon name={amenity.icon} />
              <span>{amenity.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
