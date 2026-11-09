import { SaveBanner } from "@/components/SaveBanner";
import { listInquiries } from "@/lib/content";
import { formatLongDate, formatTimestamp } from "@/lib/format";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const inquiries = await listInquiries();
  return (
    <>
      <h1>Party inquiries</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        A note appears here only after it is stored. Email is sent when Resend is configured. Until
        then the note stays in this list and is queued, and the guest is not told an email went out.
      </p>
      {inquiries.length === 0 ? <p>No inquiries yet.</p> : null}
      {inquiries.map((inquiry) => (
        <article key={inquiry.id} className="inquiry">
          <h2>{inquiry.name}</h2>
          <p>
            <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
          </p>
          <p>
            {formatLongDate(inquiry.event_date)} · Party of {inquiry.party_size}
          </p>
          <p>Received {formatTimestamp(inquiry.created_at)} (Detroit time)</p>
          <p className="lede">{inquiry.message}</p>
          <form className="row-actions" action="/api/admin/save" method="post">
            <input type="hidden" name="intent" value="inquiry-delete" />
            <input type="hidden" name="id" value={inquiry.id} />
            <label className="check">
              <input type="checkbox" name="yes" value="1" required />
              Delete this inquiry
            </label>
            <button className="btn btn-small btn-danger" type="submit">
              Delete inquiry
            </button>
          </form>
        </article>
      ))}
    </>
  );
}
