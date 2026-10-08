import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/" aria-label="Fitness Maxxing home">
        <span className={styles.brandMark} aria-hidden="true">
          FM
        </span>
        <span className={styles.brandName} aria-hidden="true">
          FITNESS
          <br />
          MAXXING
        </span>
      </Link>

      <div className={styles.contacts} aria-label="Demo contact information">
        <a
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
          <span>@fitnessmaxxing_demo</span>
        </a>
        <a href="mailto:hello@fitnessmaxxing.example">hello@fitnessmaxxing.example</a>
        <a href="tel:+18055550147">(805) 555-0147</a>
      </div>

      <p>© 2026 Fitness Maxxing</p>
    </footer>
  );
}
