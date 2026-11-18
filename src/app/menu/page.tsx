import { MenuChoices } from "@/components/SelectDishes";
import { publishedMenus } from "@/lib/menu-options";
import { TrackView } from "@/components/TrackView";
import { listMenu } from "@/lib/content";
import { menuForEasternTime } from "@/lib/menu-schedule";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = pageMeta(
  "/menu",
  "Food & Drinks",
  `Food and drinks from the printed lunch menu at ${DEFAULT_PLACE_NAME}. Lunch daily, 11–3pm. Order on Toast.`,
);

export default async function MenuPage() {
  const sections = await listMenu("public");
  return (
    <div className="page wrap">
      <TrackView name="menu_view" />
      <p className="eyebrow">Menus</p>
      <h1>Lunch, Happy Hour and Dinner</h1>
      <p className="lede">Meet me at Vinny’s, anytime</p>
      <p className="lunch-line">Lunch 11am–3pm · Happy Hour 3–5pm · Dinner 5–11pm</p>
      <p className="hint">All times Eastern. Choose any menu below.</p>
      <MenuChoices menus={publishedMenus(sections)} initialMenu={menuForEasternTime()} showHeading={false} />
    </div>
  );
}
