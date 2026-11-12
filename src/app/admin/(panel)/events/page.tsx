import { AdminForm } from "@/components/AdminForm";
import { SaveBanner } from "@/components/SaveBanner";
import { listEvents } from "@/lib/content";
import { cleanEventPhoto, formatEventStart } from "@/lib/format";
import { firstQuery } from "@/lib/messages";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function datePart(value: string): string {
  return value.slice(0, 10);
}

function timePart(value: string): string {
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : "";
}

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const events = await listEvents("admin");
  return (
    <>
      <h1>Events</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        Times are America/Detroit. <strong>Save draft</strong> keeps an event off the public site.{" "}
        <strong>Publish</strong> puts it live. <strong>Archive</strong> hides it from guests and preview but
        keeps it here so you can restore it. <strong>Delete</strong> removes it for good. Past published
        events leave Upcoming on their own. <Link href="/admin/preview">Preview site</Link>
      </p>
      <h2>New event</h2>
      <EventForm />
      {events.map((event) => (
        <article key={event.id} className="item-card">
          <p>
            <span className="badge">{event.status}</span> {formatEventStart(event.starts_at)}
          </p>
          <EventForm event={event} />
          <AdminForm className="row-actions" action="/api/admin/save">
            <input type="hidden" name="intent" value="event-delete" />
            <input type="hidden" name="id" value={event.id} />
            <label className="check">
              <input type="checkbox" name="yes" value="1" required />
              Delete this event
            </label>
            <button className="btn btn-small btn-danger" type="submit">
              Delete event
            </button>
          </AdminForm>
        </article>
      ))}
    </>
  );
}

function EventForm({
  event,
}: {
  event?: {
    id: number;
    title: string;
    starts_at: string;
    ends_at: string;
    blurb: string;
    price: string;
    photo: string;
    status: string;
  };
}) {
  const id = event ? `-${event.id}` : "";
  const archived = event?.status === "archived";
  const previewPhoto = event?.photo ? cleanEventPhoto(event.photo) : "";
  return (
    <AdminForm className="form-grid" action="/api/admin/save">
      <input type="hidden" name="intent" value={event ? "event-update" : "event-add"} />
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <div className="field">
        <label htmlFor={`title${id}`}>Title</label>
        <input id={`title${id}`} name="title" defaultValue={event?.title} required />
      </div>
      <div className="field">
        <label htmlFor={`date${id}`}>Date</label>
        <input id={`date${id}`} name="event_date" type="date" defaultValue={event ? datePart(event.starts_at) : ""} required />
      </div>
      <div className="split">
        <div className="field">
          <label htmlFor={`start${id}`}>Start</label>
          <input id={`start${id}`} name="start_time" type="time" defaultValue={event ? timePart(event.starts_at) : ""} required />
        </div>
        <div className="field">
          <label htmlFor={`end${id}`}>End, optional</label>
          <input id={`end${id}`} name="end_time" type="time" defaultValue={event ? timePart(event.ends_at) : ""} />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`blurb${id}`}>Description</label>
        <textarea id={`blurb${id}`} name="blurb" defaultValue={event?.blurb} required />
      </div>
      <div className="field">
        <label htmlFor={`price${id}`}>Price, optional</label>
        <input id={`price${id}`} name="price" defaultValue={event?.price} />
      </div>
      <div className="field">
        <label htmlFor={`photo${id}`}>Photo URL, optional</label>
        <input id={`photo${id}`} name="photo" defaultValue={event?.photo} placeholder="https://" />
        <p className="hint">
          Full web address starting with https://. Leave blank for no photo. Uploaded /media/… paths are not
          available for events until photo upload is turned on.
        </p>
        {previewPhoto ? <img src={previewPhoto} alt={event?.title || "Event photo"} style={{ maxWidth: "12rem", height: "auto" }} /> : null}
      </div>
      <div className="row-actions">
        {archived ? (
          <button className="btn" type="submit" name="action" value="draft">
            Restore draft
          </button>
        ) : (
          <>
            <button className="btn" type="submit" name="action" value="draft">
              Save draft
            </button>
            <button className="btn btn-solid" type="submit" name="action" value="publish">
              Publish
            </button>
            {event ? (
              <button className="btn" type="submit" name="action" value="archive">
                Archive
              </button>
            ) : null}
          </>
        )}
      </div>
    </AdminForm>
  );
}
