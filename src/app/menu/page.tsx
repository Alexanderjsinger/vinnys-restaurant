import { MenuChoices } from "@/components/SelectDishes";
import { publishedMenus } from "@/lib/menu-options";
import { TrackView } from "@/components/TrackView";
import { listMenu } from "@/lib/content";
import { LUNCH_SERVICE } from "@/lib/lunch-menu";
import { OrderLink } from "@/components/OrderLink";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/menu",
  "Food & Drinks",
  `Food and drinks from the printed lunch menu at ${DEFAULT_PLACE_NAME}. Lunch daily, 11–3pm. Order on Toast.`,
);

export default async function MenuPage() {
  const site = await getSite();
  const placeName = site.name.trim() || DEFAULT_PLACE_NAME;
  const sections = await listMenu("public");
  return (
    <div className="page wrap">
      <TrackView name="menu_view" />
      <p className="eyebrow">Lunch menu</p>
      <h1>Food &amp; Drinks at {placeName}</h1>
      <p className="lunch-line">{LUNCH_SERVICE}</p>
      <p>
        <OrderLink className="btn btn-solid" url={site.toastUrl} />
      </p>
      <MenuChoices menus={publishedMenus(sections)} />
    </div>
  );
}
