"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Visit & Contact" },
];

export function PrimaryNav({ phoneHref, directionsUrl }: { phoneHref?: string; directionsUrl?: string | null }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    const onOutside = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onOutside);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onOutside); };
  }, [open]);
  return (
    <nav ref={navRef} aria-label="Primary" className={`primary-nav${open ? " primary-nav--open" : ""}`}>
      <button ref={toggleRef} className="nav-toggle" type="button" aria-expanded={open} aria-controls="primary-links" onClick={() => setOpen(!open)}>
        {open ? "Close" : "Menu"}<span aria-hidden="true">{open ? " ×" : " ☰"}</span>
      </button>
      <ul id="primary-links" onClick={() => setOpen(false)}>
        {LINKS.map((link) => <li key={link.href}><Link href={link.href} aria-current={path === link.href ? "page" : undefined}>{link.label}</Link></li>)}
        {phoneHref ? <li className="nav-mobile-action"><a href={phoneHref}>Call to Reserve</a></li> : null}
        {directionsUrl ? <li className="nav-mobile-action"><a href={directionsUrl} target="_blank" rel="noopener noreferrer">Directions<span className="sr-only"> (opens in a new tab)</span></a></li> : null}
      </ul>
    </nav>
  );
}
