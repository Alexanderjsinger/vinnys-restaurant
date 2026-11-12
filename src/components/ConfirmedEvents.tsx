import Link from "next/link";
import { OrderLink } from "@/components/OrderLink";
import { GUEST_EVENTS_EMPTY_LINE } from "@/lib/events-public";
import { cleanEventPhoto, formatLongDate, formatPrice, formatTime, phoneHref, safeHttpUrl } from "@/lib/format";
import { ORDER_URL, PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import type { EventRow } from "@/lib/types";

export { splitPublicEvents } from "@/lib/events-public";

export function eventDatePart(value: string): string {
  return value.slice(0, 10);
}

export function eventTimePart(value: string): string {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : "";
}

function nextStepHref(value: string): string | null {
  return safeHttpUrl(value) ?? phoneHref(value);
}

/** Guest empty copy for public Events surfaces (admin may still say placeholder). */
export function EventsEmptyState({
  surface,
  hasEarlier = false,
}: {
  surface: "page" | "home";
  /** When earlier events exist, avoid a recovery wall above the past list. */
  hasEarlier?: boolean;
}) {
  const detail =
    surface === "page" && !hasEarlier
      ? "Check back later, plan a private party, or get in touch."
      : surface === "home" && !hasEarlier
        ? "Nothing is listed yet. Plan a private party or get in touch."
        : null;

  return (
    <div className="events-empty" role="status">
      <p>{GUEST_EVENTS_EMPTY_LINE}</p>
      {detail ? <p className="hint">{detail}</p> : null}
      {!hasEarlier ? (
        <div className="cta-row" aria-label="Next steps when no events are posted">
          <Link className="btn" href="/parties">
            Private parties
          </Link>
          <Link className="btn" href="/contact">
            Contact
          </Link>
          <a className="btn" href={RESERVE_TEL} data-track="phone_click">
            Call {PHONE_DISPLAY}
          </a>
          {surface === "page" ? <OrderLink className="btn btn-solid" url={ORDER_URL} /> : null}
        </div>
      ) : surface === "home" ? (
        <div className="cta-row" aria-label="Browse past and related pages">
          <Link className="btn" href="/events">
            All events
          </Link>
          <Link className="btn" href="/parties">
            Private parties
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function ConfirmedEvents({ events }: { events: EventRow[] }) {
  if (!events.length) {
    return <EventsEmptyState surface="page" />;
  }
  return (
    <div className="event-list">
      {events.map((event) => {
        const photo = cleanEventPhoto(event.photo);
        const time = eventTimePart(event.starts_at);
        const stepHref = event.next_step ? nextStepHref(event.next_step) : null;
        return (
          <article key={event.id} className="event">
            <h3>{event.title}</h3>
            <p>
              <time dateTime={event.starts_at}>{formatLongDate(eventDatePart(event.starts_at))}</time>
            </p>
            {time ? (
              <p>
                Starts <time dateTime={time}>{formatTime(time)}</time>
                {event.ends_at ? (
                  <>
                    {" "}
                    · Ends <time dateTime={eventTimePart(event.ends_at)}>{formatTime(eventTimePart(event.ends_at))}</time>
                  </>
                ) : null}
                {" "}
                America/Detroit
              </p>
            ) : null}
            {photo ? <img src={photo} alt={event.title} /> : null}
            {event.blurb ? <p>{event.blurb}</p> : null}
            {event.price ? <p className="price">{formatPrice(event.price)}</p> : null}
            {event.next_step ? (
              <p>
                {stepHref ? (
                  <a href={stepHref} data-track={stepHref.startsWith("tel:") ? "phone_click" : undefined}>
                    {event.next_step}
                  </a>
                ) : (
                  event.next_step
                )}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
