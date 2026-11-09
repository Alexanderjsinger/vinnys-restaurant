import { listMedia } from "@/lib/content";
import { mediaEnabled } from "@/lib/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MediaAdminPage() {
  const enabled = await mediaEnabled();
  const media = enabled ? await listMedia() : [];
  return (
    <>
      <h1>Photos</h1>
      {enabled ? (
        <form className="form-grid" action="/api/admin/media" method="post" encType="multipart/form-data">
          <div className="field">
            <label htmlFor="file">Image</label>
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          </div>
          <div className="field">
            <label htmlFor="alt">Alt text</label>
            <input id="alt" name="alt" required maxLength={180} />
          </div>
          <p className="hint">JPEG, PNG, WebP, or GIF. 4 MB maximum.</p>
          <button className="btn btn-solid" type="submit">
            Upload
          </button>
        </form>
      ) : (
        <p className="banner banner-bad" role="status">
          Photo upload is off. This deployment has no R2 bucket bound, so files cannot be stored.
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
            </li>
          ))}
        </ul>
      ) : (
        <p>No uploaded photos yet.</p>
      )}
    </>
  );
}
