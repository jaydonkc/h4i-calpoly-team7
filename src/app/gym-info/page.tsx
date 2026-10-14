import Link from "next/link";
import Image from "next/image";
import { gymLocations } from "@/data/site-content";
import "./info.css";
import { listCoaches } from "@/lib/coaches/repository";
import type { Coach } from "@/types/coach";

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
  let coaches: Coach[] = [];
  try {
    coaches = await listCoaches();
  } catch {
    /* Show the roster unavailable state. */
  }
  return (
    <div className="about-page">
      <section className="about-intro" aria-labelledby="about-title">
        <h1 id="about-title">About Us</h1>
        <p>
          Serious about showing up. Deeply unserious about everything else. Fitness Maxxing is built for big lifts, good
          company, and coaches with wildly questionable trophy cabinets.
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
                  <div className="coach-headshot">
                    {coach.headshot ? (
                      <Image
                        src={coach.headshot}
                        alt={`Headshot of ${coach.name}`}
                        width={80}
                        height={80}
                        sizes="80px"
                      />
                    ) : (
                      <span aria-hidden="true">
                        {coach.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3>{coach.name}</h3>
                    <p>{coach.specialties}</p>
                  </div>
                </div>
                <p>{coach.bio}</p>
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
              <p>{location.address}</p>
              <p>{location.hours}</p>
              <p>{location.vibe}</p>
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
