import Link from "next/link";
import { SaveBanner } from "@/components/SaveBanner";
import { getSettings, listEvents, listHours, listInquiries, listMenu, runtimeLabel } from "@/lib/content";
import { safeHttpUrl } from "@/lib/format";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const settings = await getSettings();
  const hours = await listHours();
  const menu = await listMenu("admin");
  const events = await listEvents("admin");
  const inquiries = await listInquiries();
  const drafts =
    menu.reduce((count, section) => count + section.items.filter((item) => item.status === "draft").length, 0) +
    events.filter((event) => event.status === "draft").length;
  const toast = safeHttpUrl(settings.toast_ordering_url.value);
  return (
    <>
      <h1>Overview</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        Published edits show on the public site without a rebuild. Drafts stay off the public site until you
        press Publish. Store: {await runtimeLabel()}.
      </p>
      <div className="path-grid">
        <article className="item-card">
          <h2>Ordering</h2>
          <p>{toast ? "Order button uses the saved Toast link." : "Order button is hidden until a link is saved."}</p>
          <Link href="/admin/ordering">Edit ordering</Link>
        </article>
        <article className="item-card">
          <h2>Menu and events</h2>
          <p>
            {drafts} draft{drafts === 1 ? "" : "s"}. {inquiries.length} party note{inquiries.length === 1 ? "" : "s"}.{" "}
            {hours.filter((hour) => hour.kind === "holiday").length} temporary hours row
            {hours.filter((hour) => hour.kind === "holiday").length === 1 ? "" : "s"}.
          </p>
          <p>
            <Link href="/admin/menu">Menu</Link> · <Link href="/admin/events">Events</Link> ·{" "}
            <Link href="/admin/inquiries">Inquiries</Link> · <Link href="/admin/preview">Preview</Link>
          </p>
        </article>
      </div>
      <h2>Place</h2>
      <p>
        {settings.restaurant_name.value} · {settings.address.value} · {settings.phone.value}
      </p>
      <p>
        Party notes go to {settings.email.value.trim() || settings.notify_email.value || "no address"}.
      </p>
    </>
  );
}
