import { ContactForms } from "@/components/ContactForms";
import { HoursList } from "@/components/HoursList";
import { PHONE_DISPLAY, RESERVE_TEL, STREET_ADDRESS } from "@/lib/public";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/contact",
  "Contact",
  `Call ${DEFAULT_PLACE_NAME} at 734-905-7051. 705 W. Cross St., Ypsilanti, MI 48197.`,
);

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const status = query.contact;
  const feedback = status === "signup-saved" ? "You’re on the list. Thanks for keeping in touch with Vinny’s!" : status === "message-saved" ? "Thanks for reaching out. Your message has been received." : status === "error" ? "We couldn’t save that. Please check your details and try again, or give us a call." : null;
  const site = await getSite();
  return (
    <div className="page wrap">
      <h1>Contact</h1>
      {feedback ? <p className="contact-feedback" role="status">{feedback}</p> : null}
      <div className="split">
        <section aria-labelledby="find-heading">
          <h2 id="find-heading">Find the restaurant</h2>
          <address>{site.address || STREET_ADDRESS}</address>
          {site.mapUrl ? (
            <p>
              <a
                className="btn"
                href={site.mapUrl}
                data-track="directions_click"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          ) : null}
          <p>
            <a className="btn btn-solid" href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
              Call {site.phone || PHONE_DISPLAY}
            </a>
          </p>
          {site.email ? (
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          ) : null}
          <p>
            <a href={site.phoneHref || RESERVE_TEL} data-track="phone_click">
              Call to reserve
            </a>
          </p>
        </section>
        <section className="paper" aria-labelledby="hours-heading">
          <h2 id="hours-heading">Hours</h2>
          <HoursList hours={site.hours} />
        </section>
      </div>
      <ContactForms />
    </div>
  );
}
