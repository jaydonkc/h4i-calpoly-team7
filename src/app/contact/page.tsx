import Link from "next/link";
import { gymLocations } from "@/data/site-content";
import ContactForm from "@/components/ContactForm";
import styles from "./contact.module.css";

export default function Contact() {
  return (
    <div className={styles.contactPage}>
      <section className={styles.formColumn} aria-labelledby="contact-title">
        <h1 id="contact-title">Get in Touch</h1>
        <p>
          Questions, class ideas, or a challenge to one of our extremely decorated coaches? Leave a message in the gym
          inbox.
        </p>
        <ContactForm />
      </section>

      <aside className={styles.details} aria-label="Contact details and frequently asked questions">
        <section>
          <h2>The front desk</h2>
          <p>Our fictional gym lives right here. Messages stay in the app; we do not send email or make phone calls.</p>
          <Link href="/gym-info">Meet the team →</Link>
        </section>
        <section>
          <h2>Locations &amp; Hours</h2>
          {gymLocations.map((location) => (
            <address key={location.name}>
              <strong>{location.name}</strong>
              <span>{location.address}</span>
              <span>{location.hours}</span>
            </address>
          ))}
        </section>

        <section>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqs}>
            <details>
              <summary>Memberships</summary>
              <p>View available membership options on the Purchase page.</p>
            </details>
            <details>
              <summary>Classes</summary>
              <p>Visit the class schedule for current class times and availability.</p>
            </details>
            <details>
              <summary>Locations &amp; Hours</summary>
              <p>
                All four clubs have their own opening hours. Check the list above and meet us in the fictional Fitness
                Maxxing universe.
              </p>
            </details>
            <details>
              <summary>Other</summary>
              <p>Log in and leave your question in the gym inbox. Your message is saved for the team to read.</p>
            </details>
          </div>
        </section>
      </aside>
    </div>
  );
}
