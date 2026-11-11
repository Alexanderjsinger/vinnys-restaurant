import { AdminForm } from "@/components/AdminForm";
import { SaveBanner } from "@/components/SaveBanner";
import { listMenu } from "@/lib/content";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MenuAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const menu = await listMenu("admin");
  return (
    <>
      <h1>Menu</h1>
      <SaveBanner saved={firstQuery(query.saved)} error={firstQuery(query.error)} />
      <p>
        The lunch menu is the printed menu, served daily 11–3pm. Those items are real. Gluten-free
        marks and asterisks come from that menu. Leave “Sample placeholder” unchecked unless you add
        a stand-in.
      </p>
      {menu.map((section) => (
        <article key={section.id} className="item-card">
          <AdminForm className="form-grid" action="/api/admin/save">
            <input type="hidden" name="intent" value="section-update" />
            <input type="hidden" name="id" value={section.id} />
            <div className="field">
              <label htmlFor={`section-name-${section.id}`}>Section name</label>
              <input id={`section-name-${section.id}`} name="name" defaultValue={section.name} required />
            </div>
            <div className="field">
              <label htmlFor={`section-blurb-${section.id}`}>Section note</label>
              <input id={`section-blurb-${section.id}`} name="blurb" defaultValue={section.blurb} />
            </div>
            <button className="btn" type="submit">
              Save section
            </button>
          </AdminForm>
          <div className="row-actions">
            <AdminForm action="/api/admin/save">
              <input type="hidden" name="intent" value="section-move" />
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="dir" value="up" />
              <button className="btn btn-small" type="submit">
                Move section up
              </button>
            </AdminForm>
            <AdminForm action="/api/admin/save">
              <input type="hidden" name="intent" value="section-move" />
              <input type="hidden" name="id" value={section.id} />
              <input type="hidden" name="dir" value="down" />
              <button className="btn btn-small" type="submit">
                Move section down
              </button>
            </AdminForm>
            <AdminForm action="/api/admin/save">
              <input type="hidden" name="intent" value="section-delete" />
              <input type="hidden" name="id" value={section.id} />
              <label className="check">
                <input type="checkbox" name="yes" value="1" required />
                Delete this section and its items
              </label>
              <button className="btn btn-small btn-danger" type="submit">
                Delete section
              </button>
            </AdminForm>
          </div>
          {section.items.map((item) => (
            <AdminForm key={item.id} className="form-grid item-card" action="/api/admin/save">
              <input type="hidden" name="intent" value="item-update" />
              <input type="hidden" name="id" value={item.id} />
              {item.is_sample ? <span className="badge badge-warn">Sample</span> : null}
              <div className="field">
                <label htmlFor={`item-name-${item.id}`}>Item name</label>
                <input id={`item-name-${item.id}`} name="name" defaultValue={item.name} required />
              </div>
              <div className="field">
                <label htmlFor={`item-desc-${item.id}`}>Description</label>
                <textarea id={`item-desc-${item.id}`} name="description" defaultValue={item.description} />
              </div>
              <div className="split">
                <div className="field">
                  <label htmlFor={`item-price-${item.id}`}>Price</label>
                  <input id={`item-price-${item.id}`} name="price" defaultValue={item.price} required />
                </div>
                <div className="field">
                  <label htmlFor={`item-section-${item.id}`}>Section</label>
                  <select id={`item-section-${item.id}`} name="section_id" defaultValue={item.section_id}>
                    {menu.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="check" htmlFor={`item-available-${item.id}`}>
                <input type="hidden" name="available" value="0" />
                <input
                  id={`item-available-${item.id}`}
                  type="checkbox"
                  name="available"
                  value="1"
                  defaultChecked={item.available}
                />
                Available
              </label>
              <label className="check" htmlFor={`item-gf-${item.id}`}>
                <input id={`item-gf-${item.id}`} type="checkbox" name="gluten_free" defaultChecked={item.gluten_free} />
                Gluten free, from the printed menu
              </label>
              <div className="field">
                <label htmlFor={`item-diet-${item.id}`}>Other dietary note, only if confirmed</label>
                <input id={`item-diet-${item.id}`} name="dietary" defaultValue={item.dietary} />
              </div>
              <div className="field">
                <label htmlFor={`item-status-${item.id}`}>Status</label>
                <select id={`item-status-${item.id}`} name="status" defaultValue={item.status}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="row-actions">
                <button className="btn" type="submit" name="action" value="draft">
                  Save draft
                </button>
                <button className="btn btn-solid" type="submit" name="action" value="publish">
                  Publish
                </button>
              </div>
            </AdminForm>
          ))}
          {section.items.map((item) => (
            <div key={`move-${item.id}`} className="row-actions">
              <AdminForm action="/api/admin/save">
                <input type="hidden" name="intent" value="item-move" />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="dir" value="up" />
                <button className="btn btn-small" type="submit">
                  Move {item.name} up
                </button>
              </AdminForm>
              <AdminForm action="/api/admin/save">
                <input type="hidden" name="intent" value="item-move" />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="dir" value="down" />
                <button className="btn btn-small" type="submit">
                  Move {item.name} down
                </button>
              </AdminForm>
              <AdminForm action="/api/admin/save">
                <input type="hidden" name="intent" value="item-delete" />
                <input type="hidden" name="id" value={item.id} />
                <label className="check">
                  <input type="checkbox" name="yes" value="1" required />
                  Delete {item.name}
                </label>
                <button className="btn btn-small btn-danger" type="submit">
                  Delete item
                </button>
              </AdminForm>
            </div>
          ))}
          <h3>Add item to {section.name}</h3>
          <AdminForm className="form-grid" action="/api/admin/save">
            <input type="hidden" name="intent" value="item-add" />
            <input type="hidden" name="section_id" value={section.id} />
            <div className="field">
              <label htmlFor={`add-name-${section.id}`}>Item name</label>
              <input id={`add-name-${section.id}`} name="name" required />
            </div>
            <div className="field">
              <label htmlFor={`add-desc-${section.id}`}>Description</label>
              <textarea id={`add-desc-${section.id}`} name="description" />
            </div>
            <div className="field">
              <label htmlFor={`add-price-${section.id}`}>Price</label>
              <input id={`add-price-${section.id}`} name="price" required />
            </div>
            <label className="check" htmlFor={`add-available-${section.id}`}>
              <input type="hidden" name="available" value="0" />
              <input id={`add-available-${section.id}`} type="checkbox" name="available" value="1" defaultChecked />
              Available
            </label>
            <label className="check" htmlFor={`add-gf-${section.id}`}>
              <input id={`add-gf-${section.id}`} type="checkbox" name="gluten_free" />
              Gluten free, from the printed menu
            </label>
            <div className="row-actions">
              <button className="btn" type="submit" name="action" value="draft">
                Save draft
              </button>
              <button className="btn btn-solid" type="submit" name="action" value="publish">
                Publish
              </button>
            </div>
          </AdminForm>
        </article>
      ))}
      <h2>Add section</h2>
      <AdminForm className="form-grid" action="/api/admin/save">
        <input type="hidden" name="intent" value="section-add" />
        <div className="field">
          <label htmlFor="new-section-name">Section name</label>
          <input id="new-section-name" name="name" required />
        </div>
        <div className="field">
          <label htmlFor="new-section-blurb">Section note</label>
          <input id="new-section-blurb" name="blurb" />
        </div>
        <button className="btn btn-solid" type="submit">
          Add section
        </button>
      </AdminForm>
    </>
  );
}
