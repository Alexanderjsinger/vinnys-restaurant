import { AdminForm } from "@/components/AdminForm";
import { SaveBanner } from "@/components/SaveBanner";
import { getInquiryNotifyStatus, listInquiries, listPendingNotifies, listSignups } from "@/lib/content";
import { formatLongDate, formatTimestamp } from "@/lib/format";
import { firstQuery } from "@/lib/messages";
import { NOTIFY_MAX_ATTEMPTS } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const [inquiries, signups, pending] = await Promise.all([listInquiries(), listSignups(), listPendingNotifies(50)]);
  const statuses = await Promise.all(
    inquiries.map(async (inquiry) => [inquiry.id, await getInquiryNotifyStatus(inquiry.id)] as const),
  );
  const byId = new Map(statuses);

  return (
    <>
      <h1>Messages &amp; inquiries</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        A note appears here only after it is stored. Email is marked “accepted” when Resend accepts the API
        request — that is not a mailbox delivery receipt. Until Resend is configured, notes stay queued and
        the guest is not told an email went out.
      </p>
      {pending.length ? (
        <section className="stack" style={{ marginBottom: "1.5rem" }}>
          <h2>Notification queue</h2>
          <p>
            {pending.length} pending or failed notification{pending.length === 1 ? "" : "s"} (max{" "}
            {NOTIFY_MAX_ATTEMPTS} attempts each).
          </p>
          <AdminForm action="/api/admin/save">
            <input type="hidden" name="intent" value="notify-retry" />
            <button className="btn btn-solid" type="submit">
              Retry failed notifications
            </button>
          </AdminForm>
        </section>
      ) : null}
      {inquiries.length === 0 ? <p>No inquiries yet.</p> : null}
      <section aria-labelledby="email-signups-heading">
        <h2 id="email-signups-heading">Email signups</h2>
        <p className="hint">New Contact page signups require an explicit email opt-in. This list may include older records; review their consent before importing them into a mailing service. No campaigns or welcome emails are sent automatically.</p>
        {signups.length ? <ul>{signups.map(signup => <li key={signup.id}>{signup.email} · {formatTimestamp(signup.created_at)}</li>)}</ul> : <p>No email signups yet.</p>}
      </section>
      {inquiries.map((inquiry) => {
        const notify = byId.get(inquiry.id);
        const label =
          notify?.status === "sent"
            ? `Notification accepted by Resend${notify.sent_at ? ` at ${formatTimestamp(notify.sent_at)}` : ""}`
            : notify?.status === "failed"
              ? `Notification failed after ${notify.attempts} attempts (${notify.reason})`
              : notify
                ? `Notification queued: ${notify.reason} (attempts ${notify.attempts}/${NOTIFY_MAX_ATTEMPTS})`
                : "No notification record yet";
        return (
          <article key={inquiry.id} className="inquiry">
            <h2>{inquiry.name}</h2>
            <p>
              <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
            </p>
            <p>
              {inquiry.event_date ? formatLongDate(inquiry.event_date) : "Contact message"}{inquiry.party_size > 0 ? ` · Party of ${inquiry.party_size}` : ""}
            </p>
            <p>Received {formatTimestamp(inquiry.created_at)} (Detroit time)</p>
            <p className={notify?.status === "failed" ? "banner banner-bad" : "hint"} role="status">
              {label}
            </p>
            <p className="lede">{inquiry.message}</p>
            <AdminForm className="row-actions" action="/api/admin/save">
              <input type="hidden" name="intent" value="inquiry-delete" />
              <input type="hidden" name="id" value={inquiry.id} />
              <label className="check">
                <input type="checkbox" name="yes" value="1" required />
                Delete this inquiry
              </label>
              <button className="btn btn-small btn-danger" type="submit">
                Delete inquiry
              </button>
            </AdminForm>
          </article>
        );
      })}
    </>
  );
}
