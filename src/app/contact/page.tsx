import ContactForm from "@/components/ContactForm";
import styles from "./contact.module.css";

export default function Contact() {
  return (
    <div className={styles.contactPage}>
      <section className={styles.formColumn} aria-labelledby="contact-title">
        <h1 id="contact-title">Get in Touch</h1>
        <p>Have a question? Send us a message and we’ll get back to you as soon as possible.</p>
        <ContactForm />
      </section>

      <aside className={styles.details} aria-label="Contact details and frequently asked questions">
        <section>
          <h2>Contact Information</h2>
          <address>
            <a href="mailto:hello@fitnessmaxxing.example">
              <span aria-hidden="true">✉</span>
              hello@fitnessmaxxing.example
            </a>
            <a href="tel:+18055550147">
              <span aria-hidden="true">☎</span>
              (805) 555-0147
            </a>
            <span>
              <span aria-hidden="true">●</span>
              San Luis Obispo, California
            </span>
          </address>
        </section>

        <section>
          <h2>Follow Us</h2>
          <a
            className={styles.instagram}
            href="https://www.instagram.com/fitnessmaxxing_demo/"
            target="_blank"
            rel="noreferrer"
            aria-label="Fitness Maxxing demo account on Instagram"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>
            @fitnessmaxxing_demo
          </a>
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
              <p>Location hours and full addresses are pending review.</p>
            </details>
            <details>
              <summary>Other</summary>
              <p>Use the demo email or phone number above for other questions.</p>
            </details>
          </div>
        </section>
      </aside>
    </div>
  );
}
