"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";
import { useDemoAuth } from "@/components/DemoAuthProvider";
import styles from "./Navbar.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/gym-info", label: "Our gyms" },
  { href: "/contact", label: "Contact" },
];

const navigationFont = localFont({
  src: "./fonts/Barlow-Medium.ttf",
  weight: "500",
  style: "normal",
  display: "swap",
});

const wordmarkFont = localFont({
  src: "./fonts/BarlowCondensed-BoldItalic.ttf",
  weight: "700",
  style: "italic",
  display: "swap",
});

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
}

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useDemoAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const accountLabel = user ? user.firstName + " " + user.lastName.charAt(0).toUpperCase() + "." : "Log in";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setMenuOpen(false);
    }

    const desktop = window.matchMedia("(min-width: 960px)");
    function onBreakpointChange(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpointChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpointChange);
    };
  }, [menuOpen]);

  return (
    <nav className={styles.navbar + " " + navigationFont.className} aria-label="Main navigation" ref={navRef}>
      <div className={styles.topRow}>
        <Link className={styles.brand} href="/" aria-label="Fitness Maxxing home" onClick={() => setMenuOpen(false)}>
          <span className={wordmarkFont.className} aria-hidden="true">
            Fitness Maxxing
          </span>
        </Link>
        <button
          className={styles.menuToggle}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((open) => !open)}
          ref={toggleRef}
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 8h16M4 16h16" />}
          </svg>
        </button>
      </div>

      <div id="site-navigation" className={styles.navigation} data-open={menuOpen}>
        <div className={styles.links}>
          {links.map((link) => (
            <Link
              className={styles.navLink}
              href={link.href}
              key={link.href}
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.actions}>
          <Link
            className={styles.account}
            href="/profile"
            aria-label={user ? "Account for " + user.firstName + " " + user.lastName : "Log in"}
            aria-current={isActive(pathname, "/profile") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span>{accountLabel}</span>
          </Link>
          <Link
            className={styles.membership}
            href="/purchase"
            aria-current={isActive(pathname, "/purchase") ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            Memberships
          </Link>
        </div>
      </div>
    </nav>
  );
}
