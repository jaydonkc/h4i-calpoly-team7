"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/gym-info", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/purchase", label: "Purchase" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      {links.map((link) => (
        <Link href={link.href} key={link.href} aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
