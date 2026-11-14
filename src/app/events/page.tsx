import { ConfirmedEvents, EventsEmptyState } from "@/components/ConfirmedEvents";
import { TrackView } from "@/components/TrackView";
import { listEvents } from "@/lib/content";
import { splitPublicEvents } from "@/lib/events-public";
import { detroitNowLocal } from "@/lib/format";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/events",
  "Events",
  `Confirmed events at ${DEFAULT_PLACE_NAME} in Ypsilanti. The list stays empty until a real event is posted.`,
);

export default async function EventsPage() {
  const now = detroitNowLocal();
  const site = await getSite();
  const events = await listEvents("public");
  const { upcoming, earlier } = splitPublicEvents(events, now);
  const contact = {
    phoneHref: site.phoneHref,
    phone: site.phone,
    toastUrl: site.toastUrl,
  };
  return (
    <div className="page wrap">
      <TrackView name="event_view" />
      <h1>Events</h1>
      <p className="lede">Times are America/Detroit. Only confirmed events are listed.</p>
      {upcoming.length === 0 ? (
        <EventsEmptyState surface="page" hasEarlier={earlier.length > 0} {...contact} />
      ) : null}
      {upcoming.length ? (
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading">Upcoming</h2>
          <ConfirmedEvents events={upcoming} {...contact} />
        </section>
      ) : null}
      {earlier.length ? (
        <section aria-labelledby="earlier-heading">
          <h2 id="earlier-heading">Earlier</h2>
          <ConfirmedEvents events={earlier} {...contact} />
        </section>
      ) : null}
    </div>
  );
}
