import { cleanEventPhoto, formatLongDate, formatPrice, formatTime, phoneHref, safeHttpUrl } from "@/lib/format";
import type { EventRow } from "@/lib/types";

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

export function ConfirmedEvents({ events }: { events: EventRow[] }) {
  if (!events.length) {
    return (
      <p>
        <strong>Placeholder.</strong> No confirmed events yet.
      </p>
    );
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
