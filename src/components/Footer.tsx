import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <Link className={styles.brand} href="/">
        <span className={styles.brandMark}>FM</span>
        <span className={styles.brandName}>
          FITNESS
          <br />
          MAXXING
        </span>
      </Link>

      <div className={styles.contacts}>
        <Link href="/contact">Talk to the team</Link>
        <Link href="/gym-info">Meet our legendary coaches</Link>
      </div>

      <p>© 2026 Fitness Maxxing</p>
    </footer>
  );
}
