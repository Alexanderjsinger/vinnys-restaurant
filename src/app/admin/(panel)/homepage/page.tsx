import { AdminForm } from "@/components/AdminForm";
import { SaveBanner } from "@/components/SaveBanner";
import { getSettings, listMedia } from "@/lib/content";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function HomepageAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const settings = await getSettings();
  const media = await listMedia();
  return (
    <>
      <h1>Homepage</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>These fields are the heading, the sentence under it, the optional hero image, and the footer tagline.</p>
      <AdminForm className="form-grid" action="/api/admin/save">
        <input type="hidden" name="intent" value="homepage" />
        <div className="field">
          <label htmlFor="hero_heading">Heading</label>
          <input id="hero_heading" name="hero_heading" defaultValue={settings.hero_heading.value} required />
        </div>
        <div className="field">
          <label htmlFor="hero_text">Text under the heading</label>
          <textarea id="hero_text" name="hero_text" defaultValue={settings.hero_text.value} required />
        </div>
        <div className="field">
          <label htmlFor="hero_image">Hero image</label>
          <input id="hero_image" name="hero_image" defaultValue={settings.hero_image.value} placeholder="/photos/storefront.webp" />
          {media.length ? (
            <p className="hint">
              Uploaded photos:{" "}
              {media.map((item) => (
                <span key={item.id}>
                  {" "}
                  <code>{`/media/${item.id}`}</code>
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="tagline">Footer tagline</label>
          <input id="tagline" name="tagline" defaultValue={settings.tagline.value} />
        </div>
        <label className="check" htmlFor="tagline_confirmed">
          <input id="tagline_confirmed" type="checkbox" name="tagline_confirmed" defaultChecked={settings.tagline.confirmed} />
          Tagline is confirmed
        </label>
        <button className="btn btn-solid" type="submit" name="action" value="publish">
          Publish
        </button>
      </AdminForm>
    </>
  );
}
