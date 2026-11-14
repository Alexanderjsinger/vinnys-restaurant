import { cookies } from "next/headers";
import { DRAFT_COOKIE } from "@/lib/auth";
import { firstQuery, partyError } from "@/lib/messages";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { PHONE_DISPLAY, RESERVE_TEL } from "@/lib/public";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";
import type { PartyDraft } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/parties",
  "Private parties",
  `Ask ${DEFAULT_PLACE_NAME} about a private party. Room capacity and party prices are not published.`,
);

function readDraft(raw: string | undefined): PartyDraft {
  const empty = { name: "", email: "", event_date: "", party_size: "", message: "" };
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw) as Partial<PartyDraft>;
    return {
      name: String(value.name ?? ""),
      email: String(value.email ?? ""),
      event_date: String(value.event_date ?? ""),
      party_size: String(value.party_size ?? ""),
      message: String(value.message ?? ""),
    };
  } catch {
    return empty;
  }
}

export default async function PartiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const sent = firstQuery(query.sent) === "1";
  const errorCodes = (firstQuery(query.error) ?? "").split(",").filter(Boolean);
  const jar = await cookies();
  const draft = readDraft(jar.get(DRAFT_COOKIE)?.value);
  const site = await getSite();
  return (
    <div className="page wrap">
      <h1>Private parties</h1>
      <p className="lede">
        Tell us the date, how many people, and the kind of gathering. Room size and price are not listed here. Or
        call{" "}
        <a href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
          {site.phone || PHONE_DISPLAY}
        </a>
        .
      </p>
      {sent ? (
        <div className="banner banner-good" role="status">
          <h2>Inquiry received</h2>
          <p>Thanks. We have your note. This does not hold a room or set a price.</p>
        </div>
      ) : null}
      {errorCodes.length ? (
        <div className="banner banner-bad" role="alert">
          <ul>
            {errorCodes.map((code) => (
              <li key={code}>{partyError(code)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <form className="form-grid" action="/api/inquiries" method="post">
        <p>All fields are required.</p>
        <div className="hp" aria-hidden="true">
          <label>
            Company website
            <input name="company_website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" required defaultValue={draft.name} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={draft.email}
          />
        </div>
        <div className="field">
          <label htmlFor="event_date">Date</label>
          <input id="event_date" name="event_date" type="date" required defaultValue={draft.event_date} />
        </div>
        <div className="field">
          <label htmlFor="party_size">Party size</label>
          <input
            id="party_size"
            name="party_size"
            type="number"
            min={1}
            max={500}
            required
            defaultValue={draft.party_size}
          />
          <p className="hint">Your estimate. Not a published room capacity.</p>
        </div>
        <div className="field">
          <label htmlFor="event_type">Event type</label>
          <input id="event_type" name="event_type" required defaultValue={draft.message} />
        </div>
        <button className="btn btn-solid" type="submit">
          Send inquiry
        </button>
      </form>
    </div>
  );
}
