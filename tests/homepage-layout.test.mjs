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
  assert.match(page, /href=\{phoneHref\}[^>]*>Call to Reserve/);
  assert.doesNotMatch(page, /Party size|type="date"|type="time"|label: "Happy Hour"|label: "Dinner"/);
  assert.doesNotMatch(page, /private part(?:y|ies)|href="\/parties"|testimonial|EST\.\s*1964/i);
  assert.match(page, /LUNCH_PLATES\.find/);
  assert.doesNotMatch(page, /cheesecake|pasta|SELECT_FALLBACK/i);
  assert.match(page, /src="\/photos\/storefront.webp"/);
  assert.match(page, /site\.toastUrl/);
  assert.doesNotMatch(page, /\bORDER_URL\b/);
});

test("featured dishes provide accessible static cards and full-menu navigation", () => {
  const select = read("src/components/SelectDishes.tsx");
  assert.match(select, /dish\.photo \?/);
  assert.match(select, /dish\.description/);
  assert.match(select, /formatPrice\(dish\.price\)/);
  assert.match(select, /href="\/menu"/);
  assert.doesNotMatch(select, /aria-roledescription="carousel"|select-menu-controls|select-dots/);
  const css = read("src/app/globals.css");
  assert.match(css, /\.dish-photo img\s*\{[^}]*object-fit:\s*cover/);
  assert.match(css, /\.dish-photo img\s*\{[^}]*border-radius:\s*0/);
});

test("ambient reel retains Range API, reduced-motion fallback and user pause", () => {
  const hero = read("src/components/HeroMedia.tsx");
  const lib = read("src/lib/hero.ts");
  assert.match(lib, /src:\s*"\/api\/sizzle"/);
  assert.match(hero, /\/hero\/sizzle-poster\.jpg/);
  assert.match(hero, /prefers-reduced-motion/);
  assert.match(hero, /connectionWantsDataSave/);
  assert.match(hero, /IntersectionObserver/);
  assert.match(hero, /manuallyPaused/);
  assert.match(hero, /Resume reel/);
  assert.match(hero, /Pause reel/);
  assert.match(hero, /aria-pressed=\{manuallyPaused\}/);
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
