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

      <div className={styles.contacts}>
        <Link href="/contact">Talk to the team</Link>
        <Link href="/gym-info">Meet our legendary coaches</Link>
        <span>Move well. Live loud.</span>
      </div>

      <p>© 2026 Fitness Maxxing</p>
    </footer>
  );
}
