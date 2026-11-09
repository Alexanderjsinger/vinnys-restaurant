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

test("homepage intro does not duplicate header-style CTA row", () => {
  const page = read(pagePath);
  const header = read(headerPath);

  assert.match(header, /header-actions/, "header utility CTAs stay in SiteHeader");
  assert.match(header, /Call to reserve/, "header keeps call CTA");
  assert.match(header, /Directions/, "header keeps directions CTA");
  assert.match(header, /OrderLink/, "header keeps order CTA");

  const introMatch = page.match(/className="page wrap home-intro"[\s\S]*?<\/section>/);
  assert.ok(introMatch, "home-intro section exists");
  const intro = introMatch[0];
  assert.doesNotMatch(intro, /cta-row/, "home-intro must not render a twin cta-row");
  assert.doesNotMatch(intro, /View Menu/, "menu CTA belongs in nav/cards, not a duplicate intro button row");
  assert.doesNotMatch(intro, /Get Directions/, "directions stays in header/visit, not intro twin row");
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

  // Regression: desktop must not force generic .shot img to width:100% without a height,
  // which letterboxed portrait photos into tall black columns.
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

test("hero poster and venue band keep readable landscape proportions", () => {
  const css = read(cssPath);
  assert.match(css, /\.poster\s*\{[\s\S]*?aspect-ratio:/, "poster declares an aspect ratio");
  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?aspect-ratio:/, "venue band declares an aspect ratio");
  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?object-fit:\s*cover/, "venue uses cover crop");
  assert.doesNotMatch(
    css,
    /\.venue-shot img\s*\{[^}]*max-height:\s*14rem/,
    "venue band must not crush to the old 14rem max-height",
  );
});
