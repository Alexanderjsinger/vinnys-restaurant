import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("homepage exposes honest reservation actions and published menu content", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /listMenu\("public"\)/);
  assert.match(page, /listEvents\("public"\)/);
  assert.match(read("src/components/SiteFooter.tsx"), /Call to reserve/);
  assert.doesNotMatch(page, /Party size|type="date"|type="time"|label: "Happy Hour"|label: "Dinner"/);
  assert.doesNotMatch(page, /private part(?:y|ies)|href="\/parties"|testimonial|EST\.\s*1964/i);
  assert.match(page, /LUNCH_PLATES\.find/);
  assert.doesNotMatch(page, /cheesecake|pasta|SELECT_FALLBACK/i);
  assert.match(page, /src="\/photos\/storefront.webp"/);
  assert.match(page, /site\.toastUrl/);
  assert.doesNotMatch(page, /\bORDER_URL\b/);
});

test("featured dishes show one manually selected highlight and expandable menus", () => {
  const select = read("src/components/SelectDishes.tsx");
  assert.match(select, /aria-roledescription="carousel"/);
  assert.match(select, /feature\.photo \?/);
  assert.match(select, /formatPrice\(feature\.price\)/);
  assert.match(select, /aria-expanded=\{openMenu === menu.id\}/);
  assert.match(select, /menu details aren’t available online yet/);
  assert.match(select, /aria-label="Dish previews"/);
  assert.doesNotMatch(select, /select-teasers|select-photo-arrow/);
  const options = read("src/lib/menu-options.ts");
  assert.match(options, /id: "happy-hour"[^\n]*sections: \[\]/);
  assert.match(options, /id: "dinner"[^\n]*sections: \[\]/);
});

test("ambient reel retains Range API, reduced-motion fallback and automatic looping", () => {
  const hero = read("src/components/HeroMedia.tsx");
  const lib = read("src/lib/hero.ts");
  assert.match(lib, /src:\s*"\/api\/sizzle"/);
  assert.match(hero, /\/hero\/sizzle-poster\.jpg/);
  assert.match(hero, /prefers-reduced-motion/);
  assert.match(hero, /connectionWantsDataSave/);
  assert.match(hero, /IntersectionObserver/);
  assert.match(hero, /el\.loop\s*=\s*true/);
  assert.doesNotMatch(hero, /<button|Pause reel|Resume reel|manuallyPaused/);
  assert.ok(fs.statSync(path.join(root, "public/hero/vinnys-sizzle-reel.mp4")).size < 4_000_000);
});

test("mobile navigation has disclosure state, Escape recovery and current-page links", () => {
  const nav = read("src/components/PrimaryNav.tsx");
  assert.match(nav, /aria-expanded=\{open\}/);
  assert.match(nav, /aria-controls="primary-links"/);
  assert.match(nav, /event.key === "Escape"/);
  assert.match(nav, /toggleRef.current\?\.focus/);
  assert.match(nav, /aria-current=/);
  const css = read("src/app/globals.css");
  assert.match(css, /aspect-ratio:\s*16\s*\/\s*9/);
  assert.match(css, /@media \(max-width:\s*799px\)\s*\{\s*\.sticky-bar--home\s*\{[^}]*position:\s*relative/, "mobile header stays in flow and layers the open navigation above the video");
  assert.match(css, /\.nav-toggle[^}]*min-height:\s*44px/);
});

test("visual system uses two font families and preserves CMS wordmark and hours", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /Playfair_Display/);
  assert.match(layout, /Plus_Jakarta_Sans/);
  assert.doesNotMatch(layout, /Montserrat/);
  assert.match(read("src/components/SiteHeader.tsx"), /splitPlaceWordmark/);
  assert.doesNotMatch(read("src/components/HoursList.tsx"), /Not confirmed yet/);
});
