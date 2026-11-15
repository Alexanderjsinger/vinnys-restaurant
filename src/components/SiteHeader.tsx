import Link from "next/link";
import { DEFAULT_PLACE_NAME, isVinnyShortMark, splitPlaceWordmark } from "@/lib/brand";
import { VinnyWordmark } from "@/components/VinnyWordmark";
import { HERO_LINE, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import type { PublicSite } from "@/lib/types";
import { OrderLink } from "./OrderLink";
import { PrimaryNav } from "./PrimaryNav";

export function SiteHeader({ site }: { site: PublicSite }) {
  const phoneHref = site.phoneHref || RESERVE_TEL;
  const phoneLabel = site.phone || PHONE_DISPLAY;
  const placeName = site.name.trim() || DEFAULT_PLACE_NAME;
  const { mark, rest } = splitPlaceWordmark(placeName);
  const showShortMark = isVinnyShortMark(mark);
  const brandSub = rest ? `${rest} · Ypsilanti, MI` : "Ypsilanti, MI";
  return (
    <header className="site-header">
      <div className="sticky-bar">
        <div className="wrap brand-row">
          <Link className="brand" href="/" aria-label={placeName}>
            <span className="brand-mark">
              {showShortMark ? (
                <VinnyWordmark size="sm" surface="light" decorative />
              ) : (
                mark
              )}
            </span>
            <span className="brand-sub">{brandSub}</span>
            <span className="brand-tagline">{HERO_LINE}</span>
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
