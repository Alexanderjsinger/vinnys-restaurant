import { ConfirmedEvents } from "@/components/ConfirmedEvents";
import { TrackView } from "@/components/TrackView";
import { listEvents } from "@/lib/content";
import { detroitNowLocal } from "@/lib/format";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/events",
  "Events",
  "Confirmed events at Vinny's Bar & Grill in Ypsilanti. The list stays empty until a real event is posted.",
);

export default async function EventsPage() {
  const now = detroitNowLocal();
  const events = await listEvents("public");
  const upcoming = events.filter((event) => (event.ends_at || event.starts_at) >= now);
  const earlier = events.filter((event) => (event.ends_at || event.starts_at) < now);
  return (
    <div className="page wrap">
      <TrackView name="event_view" />
      <h1>Events</h1>
      <p className="lede">Times are America/Detroit. Only published events are listed.</p>
      {upcoming.length === 0 ? <ConfirmedEvents events={[]} /> : null}
      {upcoming.length ? (
        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading">Upcoming</h2>
          <ConfirmedEvents events={upcoming} />
        </section>
      ) : null}
      {earlier.length ? (
        <section aria-labelledby="earlier-heading">
          <h2 id="earlier-heading">Earlier</h2>
          <ConfirmedEvents events={earlier} />
        </section>
      ) : null}
    </div>
  );
}
