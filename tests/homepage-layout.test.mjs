import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "src/app/page.tsx");
const cssPath = path.join(root, "src/app/globals.css");
const headerPath = path.join(root, "src/components/SiteHeader.tsx");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

test("header chrome matches Stitch light composition (Call + Order)", () => {
  const page = read(pagePath);
  const header = read(headerPath);

  assert.match(header, /header-actions/, "header utility CTAs stay in SiteHeader");
  assert.match(header, /Call/, "header keeps call CTA");
  assert.match(header, /OrderLink/, "header keeps order CTA");
  assert.match(header, /brand-mark/, "wordmark present");
  assert.match(header, /Ypsilanti, MI/, "location subtitle without invented EST year");
  assert.doesNotMatch(header, /EST\.\s*1964|Happy Hour|Weekend Brunch/i);
  assert.doesNotMatch(header, /positioning/, "old brass positioning strip removed");

  const hero = page.match(/className="stitch-hero"[\s\S]*?<\/section>/);
  assert.ok(hero, "stitch-hero section exists");
  assert.match(hero[0], /framed-hero-actions/, "media dual CTAs live on framed hero");
  assert.doesNotMatch(hero[0], /Reserve a Table|Happy Hour|EST\.\s*1964/i);
});

test("lunch plate frames use cover framing instead of letterboxed tall voids", () => {
  const css = read(cssPath);

  assert.match(css, /\.plate \.shot[\s\S]*?aspect-ratio:\s*4\s*\/\s*3/, "plate figure locks a 4/3 frame");
  assert.match(
    css,
    /\.plate \.shot img[\s\S]*?object-fit:\s*cover/,
    "plate images cover the frame (no contain letterboxing)",
  );
  assert.match(
    css,
    /\.plate \.shot img[\s\S]*?max-height:\s*none/,
    "plate images are not capped into a letterbox box",
  );

  const desktopBlocks = [...css.matchAll(/@media \(min-width:\s*800px\)\s*\{([\s\S]*?)\n\}/g)].map(
    (match) => match[1],
  );
  const plateDesktop = desktopBlocks.find((block) => block.includes(".plate-list"));
  assert.ok(plateDesktop, "desktop plate-list media query present");
  assert.doesNotMatch(
    plateDesktop,
    /\.shot img\s*\{[^}]*width:\s*100%/,
    "desktop must not set bare .shot img { width: 100% }",
  );
  assert.match(
    plateDesktop,
    /\.plate \.shot img[\s\S]*?max-height:\s*none/,
    "desktop keeps plate cover frames uncapped",
  );
});

test("framed hero keeps rounded media + honest poster structure", () => {
  const css = read(cssPath);
  const hero = read(path.join(root, "src/components/HeroMedia.tsx"));
  const page = read(pagePath);
  const reelPath = path.join(root, "public/hero/vinnys-sizzle-reel-1080p.mp4");

  assert.match(css, /\.framed-hero-frame\s*\{[\s\S]*?border-radius:/, "hero media is rounded/framed");
  assert.match(css, /\.framed-hero-media img[\s\S]*?object-fit:\s*cover/, "hero image covers the frame");
  assert.match(hero, /framed-hero/, "hero wraps in framed band");
  assert.match(hero, /framed-hero-credit/, "stock-photo honesty caption remains available");
  const heroLib = read(path.join(root, "src/lib/hero.ts"));
  assert.match(heroLib, /SIZZLE_REEL/, "approved sizzle reel constant is defined");
  assert.match(heroLib, /durationLabel:\s*"0:30"/, "duration matches measured ~30s file");
  assert.match(page, /SIZZLE_REEL\.src/, "homepage wires the approved sizzle reel");
  assert.match(page, /durationLabel=\{SIZZLE_REEL\.durationLabel\}/, "homepage passes measured duration only");
  assert.ok(fs.existsSync(reelPath), "sizzle reel mp4 is present under public/hero");
  assert.match(hero, /prefers-reduced-motion/, "hero respects reduced motion");
  assert.match(hero, /still frame|Atmosphere/, "honest atmosphere copy (no invented dazzle branding)");
  assert.doesNotMatch(hero, /1:13|1:20|DAZZLE REEL/i);
  assert.doesNotMatch(
    hero,
    /<figure className="framed-hero-media[\s\S]*?framed-hero-credit[\s\S]*?<\/figure>/,
    "honesty caption must not float as an overlay inside the hero media figure",
  );
  const creditRule = css.match(/\.framed-hero-credit\s*\{[^}]*\}/);
  assert.ok(creditRule, "framed-hero-credit rule exists");
  assert.doesNotMatch(creditRule[0], /position:\s*absolute/, "credit is not absolutely positioned over media");

  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?aspect-ratio:/, "venue band declares an aspect ratio");
  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?object-fit:\s*cover/, "venue uses cover crop");
  assert.doesNotMatch(
    css,
    /\.venue-shot img\s*\{[^}]*max-height:\s*14rem/,
    "venue band must not crush to the old 14rem max-height",
  );
});

test("stitch homepage keeps authenticity constraints in markup", () => {
  const page = read(pagePath);
  assert.match(page, /HeroMedia/, "homepage uses video-ready HeroMedia");
  assert.match(page, /stitch-hero/, "cream Stitch hero composition");
  assert.match(page, /story-split/, "cream story split");
  assert.match(page, /social-rituals/, "dark social rituals band");
  assert.doesNotMatch(
    page,
    /18 Cold Craft Taps|dry-aged|stone-fired|truffle fries|Happy Hour|Campus Nights|Pease Auditorium|Good Food, Great Times|SCRATCH TAVERN|EST\.\s*1964|Reserve a Table|Weekend Brunch/i,
  );
  assert.doesNotMatch(page, /testimonial|inquiry form|name="event_type"/i);
  assert.match(page, /Call to plan a private party/);
  assert.match(page, /Meet me at Vinny/);
  assert.match(page, /listMenu\("public"\)/);
  assert.match(page, /Listing photo of the exterior/);
});
