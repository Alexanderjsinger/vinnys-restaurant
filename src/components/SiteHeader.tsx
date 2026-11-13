import Link from "next/link";
import { DIRECTIONS_URL, PHONE_DISPLAY, POSITIONING, RESERVE_TEL, STREET_ADDRESS } from "@/lib/public";
import type { PublicSite } from "@/lib/types";
import { OrderLink } from "./OrderLink";
import { PrimaryNav } from "./PrimaryNav";

export function SiteHeader({ site }: { site: PublicSite }) {
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const directions = site.mapUrl || DIRECTIONS_URL;
  const brandName = site.name || "Vinny's Bar & Grill";
  return (
    <header className="site-header">
      <div className="sticky-bar">
        <div className="rail">
          <div className="wrap rail-inner">
            <a href={phoneHref} data-track="phone_click">
              {phoneLabel}
            </a>
            <span className="rail-dot" aria-hidden="true">
              ·
            </span>
            <span>{site.address || STREET_ADDRESS}</span>
          </div>
        </div>
        <div className="wrap brand-row">
          <Link className="brand" href="/">
            <span className="brand-mark">{brandName}</span>
          </Link>
          <PrimaryNav />
          <div className="header-actions">
            <a className="btn" href={phoneHref} data-track="phone_click">
              <span className="label-long">Call to reserve</span>
              <span className="label-short">Call</span>
            </a>
            <a className="btn" href={directions} data-track="directions_click" target="_blank" rel="noopener noreferrer">
              Directions
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <OrderLink className="btn btn-solid" url={site.toastUrl}>
              Order
            </OrderLink>
          </div>
        </div>
      </div>
      <p className="positioning">{POSITIONING}</p>
    </header>
  );
}
