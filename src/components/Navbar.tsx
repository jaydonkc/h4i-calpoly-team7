"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/gym-info", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/purchase", label: "Purchase" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useDemoAuth();
  const accountLabel = user ? `${user.firstName} ${user.lastName.charAt(0).toUpperCase()}.` : "Log in";

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
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

      <div className={styles.links}>
        {links.map((link) => (
          <Link
            className={styles.navLink}
            href={link.href}
            key={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link className={styles.account} href="/profile">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
          </svg>
        </span>
        <strong>{accountLabel}</strong>
      </Link>
    </nav>
  );
}
