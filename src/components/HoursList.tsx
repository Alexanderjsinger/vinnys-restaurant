import { detroitToday, formatTime } from "@/lib/format";
import type { Hour } from "@/lib/types";

export function HoursList({ hours }: { hours: Hour[] }) {
  const today = detroitToday();
  const temporary = hours.filter(
    (hour) =>
      hour.kind === "holiday" &&
      hour.starts_on &&
      hour.starts_on <= today &&
      today <= (hour.ends_on || hour.starts_on),
  );
  const weekly = hours.filter((hour) => hour.kind !== "holiday");
  if (!weekly.length && !temporary.length) return <p>Hours have not been posted yet.</p>;
  const confirmed = weekly.filter((hour) => hour.confirmed);
  const pending = weekly.filter((hour) => !hour.confirmed);
  return (
    <>
      {temporary.length ? (
        <>
          <p className="unconfirmed-note">Temporary hours</p>
          <HourRows hours={temporary} />
        </>
      ) : null}
      {confirmed.length ? <HourRows hours={confirmed} /> : null}
      {pending.length ? (
        <>
          <p className="unconfirmed-note">Not confirmed yet. Lunch daily, 11–3pm, is the printed menu.</p>
          <HourRows hours={pending} />
        </>
      ) : null}
    </>
  );
}

function HourRows({ hours }: { hours: Hour[] }) {
  return (
    <dl className="hours">
      {hours.map((hour) => (
        <div key={hour.id}>
          <dt>
            {hour.label}
            {hour.kind === "holiday" && hour.starts_on ? ` (${hour.starts_on}${hour.ends_on && hour.ends_on !== hour.starts_on ? `–${hour.ends_on}` : ""})` : ""}
          </dt>
          <dd>
            {formatTime(hour.opens)} – {formatTime(hour.closes)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
