import { AdminForm } from "@/components/AdminForm";
import { SaveBanner } from "@/components/SaveBanner";
import { listMedia, mediaInUse } from "@/lib/content";
import { mediaEnabled } from "@/lib/media";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MediaAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const enabled = await mediaEnabled();
  const media = enabled ? await listMedia() : [];
  const usage = await Promise.all(media.map(async (item) => [item.id, await mediaInUse(item.id)] as const));
  const inUse = new Map(usage);
  return (
    <>
      <h1>Photos</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      {enabled ? (
        <AdminForm className="form-grid" action="/api/admin/media" encType="multipart/form-data">
          <input type="hidden" name="intent" value="upload" />
          <div className="field">
            <label htmlFor="file">Image</label>
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          </div>
          <div className="field">
            <label htmlFor="alt">Alt text</label>
            <input id="alt" name="alt" required maxLength={180} />
          </div>
          <p className="hint">JPEG, PNG, WebP, or GIF. 4 MB maximum. File contents are checked on the server.</p>
          <button className="btn btn-solid" type="submit">
            Upload
          </button>
        </AdminForm>
      ) : (
        <p className="banner banner-bad" role="status">
          Photo upload is off. This deployment has no R2 bucket bound, so files cannot be stored. See{" "}
          <code>docs/owner-setup.md</code> for enablement steps.
        </p>
      )}
      {media.length ? (
        <ul className="stack">
          {media.map((item) => (
            <li key={item.id}>
              <img src={`/media/${item.id}`} alt={item.alt} style={{ maxWidth: "12rem", height: "auto" }} />
              <p>
                <code>{`/media/${item.id}`}</code> — {item.alt}
              </p>
              {inUse.get(item.id) ? (
                <p className="hint">In use on the site. Remove it from homepage/events before deleting.</p>
              ) : (
                <AdminForm className="row-actions" action="/api/admin/media">
                  <input type="hidden" name="intent" value="delete" />
                  <input type="hidden" name="id" value={item.id} />
                  <label className="check">
                    <input type="checkbox" name="yes" value="1" required />
                    Delete this photo
                  </label>
                  <button className="btn btn-small btn-danger" type="submit">
                    Delete
                  </button>
                </AdminForm>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No uploaded photos yet.</p>
      )}
    </>
  );
}
