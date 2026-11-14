"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/contact", label: "About" },
];

export function PrimaryNav() {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className="primary-nav">
      <ul>
        {LINKS.map((link) => {
          const current = path === link.href;
          return (
            <li key={link.href}>
              <Link href={link.href} aria-current={current ? "page" : undefined}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
