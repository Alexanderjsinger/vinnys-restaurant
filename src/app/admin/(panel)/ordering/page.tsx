import { SaveBanner } from "@/components/SaveBanner";
import { getSettings } from "@/lib/content";
import { safeHttpUrl } from "@/lib/format";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const settings = await getSettings();
  const connected = Boolean(safeHttpUrl(settings.toast_ordering_url.value));
  return (
    <>
      <h1>Toast ordering</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        {connected ? (
          <span className="badge badge-ok">Connected</span>
        ) : (
          <span className="badge badge-warn">Not connected</span>
        )}
      </p>
      <p>
        The public Order button uses this URL only. Leave it blank to hide Order.
      </p>
      <form className="form-grid" action="/api/admin/save" method="post">
        <input type="hidden" name="intent" value="ordering" />
        <div className="field">
          <label htmlFor="toast_ordering_url">Toast ordering URL</label>
          <input
            id="toast_ordering_url"
            name="toast_ordering_url"
            type="url"
            defaultValue={settings.toast_ordering_url.value}
            placeholder="https://"
          />
        </div>
        <button className="btn btn-solid" type="submit">
          Save ordering link
        </button>
      </form>
    </>
  );
}
