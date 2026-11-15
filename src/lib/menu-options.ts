import type { SelectMenu } from "@/components/SelectDishes";
import type { MenuSection } from "@/lib/types";
import { LUNCH_FOOTNOTE, LUNCH_SERVICE } from "@/lib/lunch-menu";

/** Only Lunch has published content. Do not repurpose its dishes as other menus. */
export function publishedMenus(menu: MenuSection[]): SelectMenu[] {
  const sections = menu.filter(section => section.items.length > 0).map(section => ({
    id: section.id, name: section.name, blurb: section.blurb,
    items: section.items.map(item => ({
      id: item.id, name: item.name, description: item.description, price: item.price,
      glutenFree: item.gluten_free, marked: item.marked,
    })),
  }));
  return [
    { id: "lunch", label: "Lunch", service: LUNCH_SERVICE, sections,
      footnote: sections.some(section => section.items.some(item => item.marked)) ? LUNCH_FOOTNOTE : null },
    { id: "happy-hour", label: "Happy Hour", service: "", sections: [], footnote: null },
    { id: "dinner", label: "Dinner", service: "", sections: [], footnote: null },
  ];
}
