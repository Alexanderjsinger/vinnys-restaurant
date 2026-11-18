import Link from "next/link";
import { SocialLinks } from "./SocialLinks";
import { HoursList } from "@/components/HoursList";
import { DEFAULT_PLACE_NAME, isVinnyShortMark, splitPlaceWordmark } from "@/lib/brand";
import { VinnyWordmark } from "@/components/VinnyWordmark";
import { PHONE_DISPLAY, RESERVE_TEL, STREET_ADDRESS } from "@/lib/public";
import type { PublicSite } from "@/lib/types";
import { OrderLink } from "./OrderLink";

export function SiteFooter({ site }: { site: PublicSite }) {
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const placeName = site.name.trim() || DEFAULT_PLACE_NAME;
  const { mark, rest } = splitPlaceWordmark(placeName);
  const showShortMark = isVinnyShortMark(mark);
  const brandSub = rest ? `${rest} · Ypsilanti, MI` : "Ypsilanti, MI";
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label={placeName}>
            <span className="brand-mark">
              {showShortMark ? <VinnyWordmark size="sm" surface="dark" decorative /> : mark}
            </span>
            <span className="brand-sub">{brandSub}</span>
            {site.tagline ? <span className="brand-tagline">{site.tagline}</span> : null}
          </Link>
          <SocialLinks />
          <div className="footer-contact">
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
        </div>
        <div className="footer-hours">
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
            <li><Link href="/about">Our Story</Link></li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
