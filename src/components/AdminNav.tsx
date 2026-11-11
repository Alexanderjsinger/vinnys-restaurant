"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CsrfInput } from "./CsrfInput";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/place", label: "Place" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/ordering", label: "Ordering" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/media", label: "Photos" },
  { href: "/admin/preview", label: "Preview" },
];

export function AdminNav({ csrfToken }: { csrfToken: string }) {
  const path = usePathname();
  return (
    <div className="admin-bar">
      <nav aria-label="Admin" className="admin-nav">
        <ul>
          {LINKS.map((link) => {
            const current = link.href === "/admin" ? path === "/admin" : path === link.href;
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
      <form action="/api/admin/logout" method="post">
        <CsrfInput token={csrfToken} />
        <button className="btn btn-small" type="submit">
          Log out
        </button>
      </form>
    </div>
  );
}
