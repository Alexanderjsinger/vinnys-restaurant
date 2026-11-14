import Link from "next/link";
import { DEFAULT_PLACE_NAME, splitPlaceWordmark } from "@/lib/brand";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { PHONE_DISPLAY, RESERVE_TEL, STREET_ADDRESS } from "@/lib/public";
import type { PublicSite } from "@/lib/types";
import { OrderLink } from "./OrderLink";
import { PrimaryNav } from "./PrimaryNav";

export function SiteHeader({ site }: { site: PublicSite }) {
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const address = site.address || STREET_ADDRESS;
  const placeName = site.name.trim() || DEFAULT_PLACE_NAME;
  const { mark, rest } = splitPlaceWordmark(placeName);
  const brandSub = rest ? `${rest} · Ypsilanti, MI` : "Ypsilanti, MI";
  return (
    <header className="site-header">
      <div className="sticky-bar">
        <div className="rail">
          <div className="wrap rail-inner">
            <span>Join us on Cross St.</span>
            <span className="rail-dot" aria-hidden="true">
              ·
            </span>
            <span>{LUNCH_SERVICE}</span>
            <span className="rail-dot" aria-hidden="true">
              ·
            </span>
            <span>Across from EMU · {address}</span>
          </div>
        </div>
        <div className="wrap brand-row">
          <Link className="brand" href="/" aria-label={placeName}>
            <span className="brand-mark">{mark}</span>
            <span className="brand-sub">{brandSub}</span>
          </Link>
          <PrimaryNav />
          <div className="header-actions">
            <a className="btn btn-outline" href={phoneHref} data-track="phone_click">
              <span className="label-long">Call {phoneLabel}</span>
              <span className="label-short">Call</span>
            </a>
            <OrderLink className="btn btn-ink" url={site.toastUrl}>
              Order
            </OrderLink>
          </div>
        </div>
      </div>
    </header>
  );
}
