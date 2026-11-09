import { redirect } from "next/navigation";
import { PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderPage() {
  const site = await getSite();
  if (site.toastUrl) redirect(site.toastUrl);
  return (
    <div className="page wrap">
      <h1>Order</h1>
      <p>Online ordering is not connected.</p>
      <p>
        Call{" "}
        <a href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
          {site.phone || PHONE_DISPLAY}
        </a>
        .
      </p>
    </div>
  );
}
