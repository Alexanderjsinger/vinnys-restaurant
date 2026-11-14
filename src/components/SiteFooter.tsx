import Link from "next/link";
import { HoursList } from "@/components/HoursList";
import { PHONE_DISPLAY, RESERVE_TEL, STREET_ADDRESS } from "@/lib/public";
import type { PublicSite } from "@/lib/types";
import { OrderLink } from "./OrderLink";

export function SiteFooter({ site }: { site: PublicSite }) {
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <p className="footer-name">{site.name}</p>
          {site.tagline ? <p className="footer-tag">{site.tagline}</p> : null}
          <address>{site.address || STREET_ADDRESS}</address>
          <p>
            <a href={phoneHref} data-track="phone_click">
              {phoneLabel}
            </a>
          </p>
          {site.email ? (
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          ) : null}
        </div>
        <div>
          <h2>Hours</h2>
          <p className="lunch-line">Lunch daily, 11–3pm</p>
          <HoursList hours={site.hours} />
        </div>
        <nav aria-label="Footer">
          <ul>
            <li>
              <Link href="/menu">Menu</Link>
            </li>
            <li>
              <Link href="/events">Events</Link>
            </li>
            {site.toastUrl ? (
              <li>
                <OrderLink url={site.toastUrl} />
              </li>
            ) : null}
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <a href={phoneHref} data-track="phone_click">
                Call to reserve
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
