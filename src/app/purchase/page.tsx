import Link from "next/link";
import { classRepository } from "@/lib/classes/class-repository";
import { availableSchedule } from "@/lib/account/reservations";
import type { ClassSchedule } from "@/types/fitness-class";
import MembershipPlans from "./MembershipPlans";
import "./purchase.css";

export const dynamic = "force-dynamic";

function displayDate(date: string, schedule: ClassSchedule) {
  const day = schedule.days.find((item) => item.date === date);
  if (day) return `${day.label}, ${day.date}`;

  const isoDate = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!isoDate) return date;

  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function MembershipsPage() {
  let schedule: ClassSchedule | null = null;

  try {
    schedule = await availableSchedule(await classRepository.getSchedule());
  } catch {
    // Membership options and FAQs remain available when the schedule cannot load.
  }

  const today = schedule?.days.find((day) => day.isToday)?.date;
  const classes = schedule?.classes.filter((fitnessClass) => fitnessClass.date === today).slice(0, 4) ?? [];

  return (
    <section className="membershipPage" aria-label="Membership plans">
      <MembershipPlans />

      <section className="classSignup" aria-labelledby="class-signup-title">
        <div className="purchaseSectionHeading">
          <h2 id="class-signup-title">Sign Up for Classes</h2>
          <Link href="/classes">View Full Schedule →</Link>
        </div>

        {schedule ? (
          classes.length > 0 ? (
            <div className="purchaseTableWrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Class</th>
                    <th scope="col">Instructor</th>
                    <th scope="col">Date</th>
                    <th scope="col">Time</th>
                    <th scope="col">Room</th>
                    <th scope="col">Spots</th>
                    <th scope="col">
                      <span className="visuallyHidden">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((fitnessClass) => (
                    <tr key={fitnessClass.id}>
                      <td>{fitnessClass.title}</td>
                      <td>{fitnessClass.coach}</td>
                      <td>{displayDate(fitnessClass.date, schedule)}</td>
                      <td>{fitnessClass.time}</td>
                      <td>{fitnessClass.room}</td>
                      <td>{fitnessClass.spots}</td>
                      <td>
                        <Link
                          href={`/classes?day=${fitnessClass.date}&class=${fitnessClass.id}#class-${fitnessClass.id}-${fitnessClass.date}`}
                        >
                          Sign Up
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="purchaseNotice">No classes are scheduled today.</p>
          )
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
              There is no recurring billing. Your simulated membership lasts one month, then expires unless you choose a
              plan again.
            </p>
          </details>
          <details>
            <summary>Can I change plans?</summary>
            <p>
              Choose another plan and complete its simulated checkout. Your latest selection becomes your current plan
              for a new month.
            </p>
          </details>
          <details>
            <summary>Can I visit other locations?</summary>
            <p>
              Yes. Every plan includes all four Fitness Maxxing locations. Pick the one that best matches your training
              arc.
            </p>
          </details>
          <details>
            <summary>Are classes included?</summary>
            <p>
              Every plan includes every group class. Reservations depend on available spots; booking is open to
              signed-in members of our fictional gym.
            </p>
          </details>
        </div>
      </section>
    </section>
  );
}
