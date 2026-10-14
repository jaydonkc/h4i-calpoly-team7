import Link from "next/link";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import type { ClassSchedule } from "@/types/fitness-class";
import UpcomingClasses from "./UpcomingClasses";
import { hasClassStarted } from "@/lib/classes/class-start";
import MembershipPlans from "./MembershipPlans";
import "./purchase.css";

export const dynamic = "force-dynamic";

export default async function MembershipsPage() {
  let schedule: ClassSchedule | null = null;

  try {
    schedule = await availableSchedule(await classRepository.getSchedule());
  } catch {
    // Membership options and FAQs remain available when the schedule cannot load.
  }

  const classes = schedule?.classes.filter((item) => !hasClassStarted(item.date, item.time)).slice(0, 4) ?? [];

  return (
    <section className="membershipPage" aria-label="Membership plans">
      <MembershipPlans />

      <section className="classSignup" aria-labelledby="class-signup-title">
        <div className="purchaseSectionHeading">
          <h2 id="class-signup-title">Sign Up for Classes</h2>
          <Link href="/classes">View Full Schedule →</Link>
        </div>

        {schedule ? (
          <UpcomingClasses initialClasses={classes} />
        ) : (
          <p className="purchaseNotice" role="status">
            The class schedule is temporarily unavailable.
          </p>
        )}
      </section>

      <section className="membershipFaq" aria-labelledby="membership-faq-title">
        <h2 id="membership-faq-title">Membership FAQ</h2>
        <div>
          <details>
            <summary>Can I cancel anytime?</summary>
            <p>
              There is no recurring billing. Your membership lasts one month, then expires unless you choose a plan
              again.
            </p>
          </details>
          <details>
            <summary>Can I change plans?</summary>
            <p>
              Choose another plan and complete checkout. Your latest selection becomes your current plan for a new
              month.
            </p>
          </details>
          <details>
            <summary>Can I visit other locations?</summary>
            <p>
              Yes. Every plan includes every Fitness Maxxing location. Pick the one that best matches your training arc.
            </p>
          </details>
          <details>
            <summary>Are classes included?</summary>
            <p>
              Every plan includes every group class. Reservations depend on available spots; booking is open to
              signed-in members of Fitness Maxxing.
            </p>
          </details>
        </div>
      </section>
    </section>
  );
}
