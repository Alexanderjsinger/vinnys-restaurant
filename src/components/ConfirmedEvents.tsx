import Link from "next/link";
import { EventPhoto } from "@/components/EventPhoto";
import { OrderLink } from "@/components/OrderLink";
import { GUEST_EVENTS_EMPTY_LINE } from "@/lib/events-public";
import { cleanEventPhoto, eventNextStepHref, formatLongDate, formatPrice, formatTime } from "@/lib/format";
import { PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import type { EventRow } from "@/lib/types";

export { splitPublicEvents } from "@/lib/events-public";

export function eventDatePart(value: string): string {
  return value.slice(0, 10);
}

export function eventTimePart(value: string): string {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : "";
}

type EmptyContact = {
  /** CMS phone href when configured; falls back to known reserve tel. */
  phoneHref?: string | null;
  /** CMS phone display when configured. */
  phone?: string | null;
  /** CMS Toast ordering URL; Order CTA hidden when empty. */
  toastUrl?: string | null;
};

/** Guest empty copy for public Events surfaces (admin may still say placeholder). */
export function EventsEmptyState({
  surface,
  hasEarlier = false,
  phoneHref: sitePhoneHref = null,
  phone: sitePhone = null,
  toastUrl = null,
}: {
  surface: "page" | "home";
  /** When earlier events exist, avoid a recovery wall above the past list. */
  hasEarlier?: boolean;
} & EmptyContact) {
  const detail =
    surface === "page" && !hasEarlier
      ? "Check back later, plan a private party, or get in touch."
      : surface === "home" && !hasEarlier
        ? "Nothing is listed yet. Plan a private party or get in touch."
        : null;
  const callHref = sitePhoneHref || RESERVE_TEL;
  const callLabel = sitePhone || PHONE_DISPLAY;

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
          <a className="btn" href={callHref} data-track="phone_click">
            Call {callLabel}
          </a>
          {surface === "page" ? <OrderLink className="btn btn-solid" url={toastUrl} /> : null}
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

export function ConfirmedEvents({
  events,
  phoneHref: sitePhoneHref = null,
  phone: sitePhone = null,
  toastUrl = null,
}: {
  events: EventRow[];
} & EmptyContact) {
  if (!events.length) {
    return (
      <EventsEmptyState
        surface="page"
        phoneHref={sitePhoneHref}
        phone={sitePhone}
        toastUrl={toastUrl}
      />
    );
  }
  return (
    <div className="event-list">
      {events.map((event) => {
        const photo = cleanEventPhoto(event.photo);
        const time = eventTimePart(event.starts_at);
        const stepHref = event.next_step ? eventNextStepHref(event.next_step) : null;
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
            {photo ? <EventPhoto src={photo} alt={event.title} /> : null}
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
