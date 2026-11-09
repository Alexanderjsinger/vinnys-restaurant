import { ConfirmedEvents } from "@/components/ConfirmedEvents";
import { listEvents, listMenu } from "@/lib/content";
import { detroitNowLocal, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PreviewPage() {
  const now = detroitNowLocal();
  const menu = await listMenu("preview");
  const events = (await listEvents("preview")).filter((event) => (event.ends_at || event.starts_at) >= now);
  return (
    <>
      <h1>Preview</h1>
      <p>Drafts and published records. Archived records stay out. Guests do not see this page.</p>
      <h2>Upcoming events</h2>
      <ConfirmedEvents events={events} />
      <h2>Menu</h2>
      {menu.map((section) => (
        <section key={section.id}>
          <h3>
            {section.name} <span className="badge">{section.status}</span>
          </h3>
          <ul>
            {section.items.map((item) => (
              <li key={item.id}>
                {item.name} {formatPrice(item.price)} <span className="badge">{item.status}</span>
                {item.available ? "" : " (unavailable)"}
                {item.gluten_free ? " · gluten free" : ""}
                {item.dietary ? ` · ${item.dietary}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
