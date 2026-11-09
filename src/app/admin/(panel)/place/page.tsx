import { Field } from "@/components/Field";
import { SaveBanner } from "@/components/SaveBanner";
import { getSettings, listHours } from "@/lib/content";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PlacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const settings = await getSettings();
  const hours = await listHours();
  return (
    <>
      <h1>Place</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        Name, address, phone, and hours show on the public site. Listings used for the starting
        phone and hours are unconfirmed until you check them. 12:00 a.m. is midnight.
      </p>
      <form className="form-grid" action="/api/admin/save" method="post">
        <input type="hidden" name="intent" value="place" />
        <Field
          label="Restaurant name"
          name="restaurant_name"
          value={settings.restaurant_name.value}
          confirmed={settings.restaurant_name.confirmed}
          required
        />
        <Field
          label="Address"
          name="address"
          value={settings.address.value}
          confirmed={settings.address.confirmed}
          required
          hint="Shown in the header and on the contact page. The map link is a Google Maps search for this text."
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          value={settings.phone.value}
          confirmed={settings.phone.confirmed}
          hint="Confirmed. Guests call this number to reserve."
        />
        <Field
          label="Email"
          name="email"
          type="email"
          value={settings.email.value}
          confirmed={settings.email.confirmed}
          hint="Shown on the contact page when it is filled in. Party notes go here when it is set."
        />
        <Field
          label="Party note email"
          name="notify_email"
          type="email"
          value={settings.notify_email.value}
          confirmed={false}
          hint="Used when the place email is blank. Editable."
        />
        <fieldset className="stack">
          <legend>Hours</legend>
          {hours.map((hour) => (
            <div key={hour.id} className="item-card">
              <input type="hidden" name="hour_id" value={hour.id} />
              <div className="field-label">
                <span>Hours row</span>
                {hour.confirmed ? (
                  <span className="badge badge-ok">Confirmed</span>
                ) : (
                  <span className="badge badge-warn">Unconfirmed</span>
                )}
              </div>
              <div className="field">
                <label htmlFor={`hour_label_${hour.id}`}>Label</label>
                <input
                  id={`hour_label_${hour.id}`}
                  name={`hour_label_${hour.id}`}
                  defaultValue={hour.label}
                  required
                />
              </div>
              <div className="split">
                <div className="field">
                  <label htmlFor={`hour_opens_${hour.id}`}>Opens</label>
                  <input
                    id={`hour_opens_${hour.id}`}
                    name={`hour_opens_${hour.id}`}
                    type="time"
                    defaultValue={hour.opens}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor={`hour_closes_${hour.id}`}>Closes</label>
                  <input
                    id={`hour_closes_${hour.id}`}
                    name={`hour_closes_${hour.id}`}
                    type="time"
                    defaultValue={hour.closes === "24:00" ? "00:00" : hour.closes}
                    required
                  />
                </div>
              </div>
              <label className="check" htmlFor={`hour_confirmed_${hour.id}`}>
                <input
                  id={`hour_confirmed_${hour.id}`}
                  type="checkbox"
                  name={`hour_confirmed_${hour.id}`}
                  defaultChecked={hour.confirmed}
                />
                Mark these hours confirmed
              </label>
            </div>
          ))}
        </fieldset>
        <button className="btn btn-solid" type="submit">
          Save place
        </button>
      </form>

      <h2>Temporary hours</h2>
      <form className="form-grid" action="/api/admin/save" method="post">
        <input type="hidden" name="intent" value="holiday-add" />
        <div className="field">
          <label htmlFor="holiday-label">Label</label>
          <input id="holiday-label" name="label" required placeholder="Christmas Eve" />
        </div>
        <div className="split">
          <div className="field">
            <label htmlFor="holiday-start">From</label>
            <input id="holiday-start" name="starts_on" type="date" required />
          </div>
          <div className="field">
            <label htmlFor="holiday-end">Through</label>
            <input id="holiday-end" name="ends_on" type="date" required />
          </div>
        </div>
        <div className="split">
          <div className="field">
            <label htmlFor="holiday-open">Opens</label>
            <input id="holiday-open" name="opens" type="time" required />
          </div>
          <div className="field">
            <label htmlFor="holiday-close">Closes</label>
            <input id="holiday-close" name="closes" type="time" required />
          </div>
        </div>
        <button className="btn" type="submit">
          Add temporary hours
        </button>
      </form>

      <h2>Add hours</h2>
      <form className="form-grid" action="/api/admin/save" method="post">
        <input type="hidden" name="intent" value="hour-add" />
        <div className="field">
          <label htmlFor="new-hour-label">Label</label>
          <input id="new-hour-label" name="label" required placeholder="Friday" />
        </div>
        <div className="split">
          <div className="field">
            <label htmlFor="new-hour-open">Opens</label>
            <input id="new-hour-open" name="opens" type="time" required />
          </div>
          <div className="field">
            <label htmlFor="new-hour-close">Closes</label>
            <input id="new-hour-close" name="closes" type="time" required />
          </div>
        </div>
        <button className="btn" type="submit">
          Add hours
        </button>
      </form>

      {hours.map((hour) => (
        <div key={`actions-${hour.id}`} className="row-actions">
          <form action="/api/admin/save" method="post">
            <input type="hidden" name="intent" value="hour-move" />
            <input type="hidden" name="id" value={hour.id} />
            <input type="hidden" name="dir" value="up" />
            <button className="btn btn-small" type="submit">
              Move {hour.label} up
            </button>
          </form>
          <form action="/api/admin/save" method="post">
            <input type="hidden" name="intent" value="hour-move" />
            <input type="hidden" name="id" value={hour.id} />
            <input type="hidden" name="dir" value="down" />
            <button className="btn btn-small" type="submit">
              Move {hour.label} down
            </button>
          </form>
          <form action="/api/admin/save" method="post">
            <input type="hidden" name="intent" value="hour-delete" />
            <input type="hidden" name="id" value={hour.id} />
            <label className="check">
              <input type="checkbox" name="yes" value="1" required />
              Delete {hour.label}
            </label>
            <button className="btn btn-small btn-danger" type="submit">
              Delete hours
            </button>
          </form>
        </div>
      ))}
    </>
  );
}
