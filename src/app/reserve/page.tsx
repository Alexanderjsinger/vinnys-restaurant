import type { Metadata } from "next";
import { PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Call to reserve" };

export default async function ReservePage() {
  const site = await getSite();
  return (
    <div className="page wrap">
      <h1>Call to reserve</h1>
      <p>
        <a className="btn btn-solid" href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
          {site.phone || PHONE_DISPLAY}
        </a>
      </p>
    </div>
  );
}
