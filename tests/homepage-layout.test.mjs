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
  assert.match(header, /VinnyWordmark/, "sign wordmark component in header");
  assert.match(header, /brand-tagline/, "Meet me tagline lives in white header near brand");
  assert.match(header, /HERO_LINE/, "header tagline uses locked Meet me line");
  assert.match(header, /splitPlaceWordmark|site\.name/, "nav brand comes from CMS place name");
  assert.match(header, /Ypsilanti, MI/, "location subtitle without invented EST year");
  assert.doesNotMatch(header, /className="rail"|Join us on Cross St/, "black info bar stays off the header");
  assert.doesNotMatch(header, /EST\.\s*1964|Happy Hour|Weekend Brunch/i);
  assert.doesNotMatch(header, /positioning/, "old brass positioning strip removed");

  const hero = page.match(/className="stitch-hero reel-hero"[\s\S]*?<\/section>/);
  assert.ok(hero, "stitch-hero section exists");
  assert.doesNotMatch(hero[0], /Historic Cross Street/, "location eyebrow is removed from the wordmark block");
  assert.match(hero[0], /stitch-wordmark-mark/, "hero keeps short wordmark art direction");
  assert.match(hero[0], /VinnyWordmark/, "hero uses sign wordmark");
  assert.match(hero[0], /surface="dark"/, "wordmark is light against the reel");
  assert.match(hero[0], /reel-hero-copy/, "wordmark and line sit on the reel");
  assert.match(hero[0], /stitch-wordmark-rest/, "hero shows Bar & Grill from CMS place name");
  assert.match(hero[0], /reserve-bar/, "reservation bar sits on the reel");
  assert.match(hero[0], /href="\/reserve"/, "Reserve opens the existing call-to-reserve page");
  assert.match(hero[0], /Party size/);
  assert.match(hero[0], /type="date"/);
  assert.match(hero[0], /type="time"/);
  assert.doesNotMatch(hero[0], /View menus|sizzle-below|framed-hero-actions/, "phone and menu row under the reel is gone");
  assert.doesNotMatch(hero[0], /Call \{phoneLabel\}/, "hero does not repeat the header phone CTA");
  assert.doesNotMatch(hero[0], /\/api\/inquiries|name="party_size"|name="event_date"/, "bar does not post a booking");
  assert.doesNotMatch(hero[0], /sizzle-lockup/, "Meet me removed from cream/sizzle sub-header");
  assert.doesNotMatch(hero[0], /overlay=\{/, "no copy/CTA overlay on moving video");
  assert.doesNotMatch(hero[0], /Reserve a Table|Happy Hour|EST\.\s*1964/i);
});

test("lunch plate frames use cover framing instead of letterboxed tall voids", () => {
  const css = read(cssPath);

  const feature = css.match(/\.lunch-feature-photo\s*\{[^}]*\}/);
  assert.ok(feature, "featured lunch photo frame exists");
  assert.match(feature[0], /aspect-ratio:\s*4\s*\/\s*5/, "mobile featured plate locks a 4/5 frame");
  assert.match(feature[0], /padding:\s*0/);
  assert.match(feature[0], /border-radius:\s*0/);
  assert.match(feature[0], /border:\s*0/);

  const featureImg = css.match(/\.lunch-feature-photo img\s*\{[^}]*\}/);
  assert.ok(featureImg, "featured lunch image rule exists");
  assert.match(featureImg[0], /object-fit:\s*cover/, "featured plate covers the frame");
  assert.match(featureImg[0], /width:\s*100%/);
  assert.match(featureImg[0], /height:\s*100%/);
  assert.match(featureImg[0], /max-height:\s*none/);
  assert.match(featureImg[0], /padding:\s*0/);
  assert.match(featureImg[0], /border-radius:\s*0/);
  assert.doesNotMatch(featureImg[0], /object-fit:\s*contain/);

  const thumb = css.match(/\.dish-thumb\s*\{[^}]*\}/);
  assert.ok(thumb, "smaller dish frame exists");
  assert.match(thumb[0], /padding:\s*0/);
  assert.match(thumb[0], /border-radius:\s*0/);
  assert.match(thumb[0], /aspect-ratio:\s*4\s*\/\s*3/);
  const thumbImg = css.match(/\.dish-thumb img\s*\{[^}]*\}/);
  assert.ok(thumbImg, "smaller dish image rule exists");
  assert.match(thumbImg[0], /object-fit:\s*cover/);
  assert.match(thumbImg[0], /max-height:\s*none/);
  assert.match(thumbImg[0], /padding:\s*0/);
  assert.match(thumbImg[0], /border-radius:\s*0/);

  const desktopBlocks = [...css.matchAll(/@media \(min-width:\s*800px\)\s*\{([\s\S]*?)\n\}/g)].map(
    (match) => match[1],
  );
  const plateDesktop = desktopBlocks.find((block) => block.includes(".lunch-feature-photo"));
  assert.ok(plateDesktop, "desktop featured-plate media query present");
  assert.match(
    plateDesktop,
    /\.lunch-feature-photo\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/,
    "desktop featured plate is a 4/3 cover frame beside the card",
  );
  assert.match(
    plateDesktop,
    /\.dish-row\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/,
    "smaller dishes stay in a row of slots, not a second hero",
  );
  const shotDesktop = desktopBlocks.find((block) => block.includes(".photo-row"));
  assert.ok(shotDesktop, "menu photo-row desktop rule still present");
  assert.doesNotMatch(
    shotDesktop,
    /\.shot img\s*\{[^}]*width:\s*100%/,
    "desktop must not set bare .shot img { width: 100% }",
  );
});

test("framed hero is full-bleed ambient media + honest poster structure", () => {
  const css = read(cssPath);
  const hero = read(path.join(root, "src/components/HeroMedia.tsx"));
  const page = read(pagePath);
  const reelPath = path.join(root, "public/hero/vinnys-sizzle-reel.mp4");

  const framedHeroRule = css.match(/\.framed-hero\s*\{[^}]*\}/);
  assert.ok(framedHeroRule, "framed-hero rule exists");
  assert.match(framedHeroRule[0], /width:\s*100%/, "sizzle container spans full width");
  assert.match(framedHeroRule[0], /max-width:\s*none/, "sizzle is not capped to content column");
  const frameRule = css.match(/\.framed-hero-frame\s*\{[^}]*\}/);
  assert.ok(frameRule, "framed-hero-frame rule exists");
  assert.match(frameRule[0], /border-radius:\s*0/, "edge-to-edge frame (no inset rounded card)");
  assert.match(frameRule[0], /width:\s*100%/, "frame width forced full-bleed (aspect-ratio must not shrink it)");
  assert.doesNotMatch(
    frameRule[0],
    /aspect-ratio:/,
    "no aspect-ratio on frame — it was shrinking width under max-height",
  );
  assert.match(css, /\.framed-hero-media img[\s\S]*?object-fit:\s*cover/, "hero image covers the frame");
  assert.match(hero, /framed-hero/, "hero wraps in framed band");
  assert.doesNotMatch(hero, /framed-hero-credit/, "hero caption is not rendered");
  assert.doesNotMatch(
    hero,
    /Atmosphere reel|Not a photo of Vinny/,
    "stock-still disclaimer is not guest copy on the hero",
  );
  const heroLib = read(path.join(root, "src/lib/hero.ts"));
  assert.match(heroLib, /SIZZLE_REEL/, "approved sizzle reel constant is defined");
  assert.match(heroLib, /durationLabel:\s*"0:16"/, "duration matches measured ~16.13s file");
  assert.match(page, /SIZZLE_REEL\.src/, "homepage wires the approved sizzle reel");
  assert.match(page, /durationLabel=\{SIZZLE_REEL\.durationLabel\}/, "homepage passes measured duration only");
  assert.match(
    page,
    /<section className="stitch-hero reel-hero"[\s\S]*?<HeroMedia[\s\S]*?\/>\s*<div className="reel-hero-copy"[\s\S]*?<div\s+className="reserve-bar"/,
    "the reel is the first view, with the wordmark and reservation bar on the video",
  );
  assert.doesNotMatch(
    page,
    /<div className="wrap">\s*<div className="sizzle-below">/,
    "the old phone and menu row is not wrapped under the reel",
  );
  const reserveBar = css.match(/\.reserve-bar\s*\{[^}]*\}/);
  assert.ok(reserveBar, "reserve-bar rule exists");
  assert.match(reserveBar[0], /width:\s*100%/, "reservation bar is full-bleed");
  assert.match(reserveBar[0], /margin:\s*0/, "reservation bar has no outer gap");
  assert.match(reserveBar[0], /background:\s*var\(--black\)/);
  assert.match(reserveBar[0], /border-radius:\s*0/);
  const reelRule = css.match(/\.stitch-hero\.reel-hero\s*\{[^}]*\}/);
  assert.ok(reelRule, "fullscreen reel rule exists");
  assert.match(reelRule[0], /width:\s*100vw/, "reel is the viewport width");
  assert.match(reelRule[0], /height:\s*100dvh/, "reel is the dynamic viewport height");
  assert.match(reelRule[0], /padding:\s*0/, "no cream box around the video");
  assert.doesNotMatch(reelRule[0], /aspect-ratio:/);
  const reelFrame = css.match(/\.reel-hero \.framed-hero-frame\s*\{[^}]*\}/);
  assert.ok(reelFrame, "reel frame fills the hero");
  assert.match(reelFrame[0], /height:\s*100%/);
  assert.match(reelFrame[0], /max-height:\s*none/, "reel is not capped into a short band");
  const reelBar = css.match(/\.reel-hero \.reserve-bar\s*\{[^}]*\}/);
  assert.ok(reelBar, "reservation bar is positioned on the reel");
  assert.match(reelBar[0], /position:\s*absolute/);
  assert.match(reelBar[0], /bottom:\s*0/);
  assert.match(reelBar[0], /left:\s*0/);
  assert.match(reelBar[0], /right:\s*0/);
  assert.match(css, /\.reserve-bar \.reserve-bar-submit[\s\S]*?background:\s*var\(--gold-hot\)/);
  assert.doesNotMatch(css, /#e72225|#e62527/, "reservation bar does not copy the reference red");
  assert.ok(fs.existsSync(reelPath), "sizzle reel mp4 is present under public/hero");
  assert.match(hero, /\/hero\/sizzle-bartender\.jpg/, "hero poster is the bartender still from the reel");
  assert.doesNotMatch(hero, /meet-me\.jpg/, "hero poster is not the stock table photo");
  assert.match(hero, /prefers-reduced-motion/, "hero respects reduced motion");
  assert.match(hero, /saveData|connectionWantsDataSave/, "Save-Data still shows the poster");
  assert.match(hero, /IntersectionObserver/, "ambient play uses viewport visibility");
  assert.match(hero, /el\.loop\s*=\s*true/, "reel loops while it plays");
  assert.doesNotMatch(hero, /manualPauseRef|togglePlayback|framed-ambient-control|<button/, "no play or pause control");
  assert.doesNotMatch(hero, /framed-play/, "no play icon");
  assert.doesNotMatch(hero, /Watch atmosphere reel/, "no persistent watch-label chrome");
  assert.doesNotMatch(hero, /1:13|1:20|DAZZLE REEL/i);
  assert.doesNotMatch(css, /\.framed-hero-credit\s*\{/, "removed hero caption has no layout rule");

  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?aspect-ratio:/, "venue band declares an aspect ratio");
  assert.match(css, /\.venue-shot img\s*\{[\s\S]*?object-fit:\s*cover/, "venue uses cover crop");
  assert.doesNotMatch(
    css,
    /\.venue-shot img\s*\{[^}]*max-height:\s*14rem/,
    "venue band must not crush to the old 14rem max-height",
  );
});

test("Cross Street band is full-bleed: photo column is half the section, no frame or cap", () => {
  const css = read(cssPath);
  const split = css.match(/\.story-split\s*\{[^}]*\}/);
  assert.ok(split, "story-split rule exists");
  assert.match(split[0], /width:\s*100%/, "section is the full width of its band");
  assert.match(split[0], /padding:\s*0/, "section has no padding around the photograph");
  assert.match(split[0], /margin:\s*0/);

  const desktopBlocks = [...css.matchAll(/@media \(min-width:\s*860px\)\s*\{([\s\S]*?)\n\}/g)].map(
    (match) => match[1],
  );
  const gridDesktop = desktopBlocks.find((block) => block.includes(".story-grid"));
  assert.ok(gridDesktop, "desktop story-grid rule present");
  assert.match(
    gridDesktop,
    /\.story-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(0,\s*50%\)/,
    "photograph column is half the section, not a capped auto track",
  );
  assert.doesNotMatch(css, /min\(50vw,\s*40rem\)/, "photograph is not capped at 40rem");

  const frame = css.match(/\.story-frame\s*\{[^}]*\}/);
  assert.ok(frame, "story-frame rule exists");
  assert.match(frame[0], /padding:\s*0/);
  assert.match(frame[0], /border-radius:\s*0/);
  assert.match(frame[0], /width:\s*100%/);
  assert.match(frame[0], /max-width:\s*none/, "frame is not capped inside the band");

  const img = css.match(/\.story-frame img\s*\{[^}]*\}/);
  assert.ok(img, "story-frame img rule exists");
  assert.match(img[0], /width:\s*100%/);
  assert.match(img[0], /height:\s*auto/, "uniform scale, section height follows the file");
  assert.match(img[0], /padding:\s*0/);
  assert.match(img[0], /border-radius:\s*0/);
  assert.match(img[0], /max-height:\s*none/);
  assert.doesNotMatch(img[0], /object-fit:/, "the listing photo is not cropped or stretched");
});

test("stitch homepage keeps authenticity constraints in markup", () => {
  const page = read(pagePath);
  const css = read(cssPath);
  assert.match(page, /HeroMedia/, "homepage uses video-ready HeroMedia");
  assert.match(page, /stitch-hero/, "cream Stitch hero composition");
  assert.match(page, /story-split/, "cream story split");
  assert.match(page, /destination-tiles/, "destination tiles replace the curated band");
  assert.doesNotMatch(
    page,
    /18 Cold Craft Taps|dry-aged|stone-fired|truffle fries|Happy Hour|Campus Nights|Pease Auditorium|Good Food, Great Times|SCRATCH TAVERN|EST\.\s*1964|Reserve a Table|Weekend Brunch|Birthday list|Lunch, dinner and everything after/i,
  );
  assert.doesNotMatch(page, /testimonial|inquiry form|name="event_type"/i);
  assert.doesNotMatch(page, /private part(?:y|ies)|\/parties|Party details/i);
  assert.match(page, /isMeetMeLine/, "cream hero omits Meet me when CMS hero_text is only that line");
  assert.doesNotMatch(page, /Historic Cross Street/, "wordmark block has no location eyebrow");
  assert.match(page, /listMenu\("public"\)/);
  assert.match(page, /Listing photo of the exterior/);

  const tiles = page.match(/className="destination-tiles"[\s\S]*?<\/section>/);
  assert.ok(tiles, "destination tiles exist");
  assert.doesNotMatch(tiles[0], /Curated for every|Social rituals|figcaption|phoneHref|Call |OrderLink|private part/i);
  assert.match(tiles[0], /href="\/reserve"[\s\S]*Reservations/);
  assert.match(tiles[0], /href="\/menu"[\s\S]*Menus/);
  assert.match(tiles[0], /href="\/events"[\s\S]*Events/);
  assert.match(tiles[0], /src="\/hero\/meet-me\.jpg"/, "table photo stays on a tile");
  const lunch = page.match(/className="band-cream food-band"[\s\S]*?<\/section>/);
  assert.ok(lunch, "lunch plates section exists");
  assert.match(page, /menuName === "VINNY'S BURGER"/);
  assert.match(lunch[0], /featuredPlate\.item\.description/);
  assert.match(lunch[0], /formatPrice\(featuredPlate\.item\.price\)/);
  assert.match(lunch[0], /otherPlates\.map/);
  assert.match(lunch[0], /href="\/menu"/);
  assert.match(lunch[0], /OrderLink/);
  assert.doesNotMatch(lunch[0], /truffle|review|testimonial|CHEF'S FAVORITE/i);

  const layout = read(path.join(root, "src/app/layout.tsx"));
  assert.match(layout, /Montserrat/, "Meet me loads Montserrat through next/font");
  assert.match(layout, /--font-tagline/);
  assert.match(css, /\.brand-tagline\s*\{[^}]*var\(--font-tagline\)/);
  assert.match(
    css,
    /\.stitch-wordmark-mark \.vinny-wordmark--lg\s*\{[^}]*height:\s*clamp\(2\.56rem,\s*9\.6vw,\s*5\.6rem\)/,
    "hero wordmark block is about 20% shorter",
  );

  const hours = read(path.join(root, "src/components/HoursList.tsx"));
  assert.doesNotMatch(hours, /Not confirmed yet/, "draft hours note is not guest copy");
  const footer = read(path.join(root, "src/components/SiteFooter.tsx"));
  assert.match(footer, /Lunch daily, 11–3pm/, "printed lunch hours stay in the footer");
  assert.match(footer, /brand-mark/, "footer wordmark uses the header lockup");
  assert.match(footer, /brand-tagline/, "footer Meet me uses the same tagline style");
  assert.match(footer, /VinnyWordmark size="sm"/, "footer wordmark size matches the header");

  const tile = css.match(/\.destination-tile\s*\{[^}]*\}/);
  assert.ok(tile, "destination tile rule exists");
  assert.match(tile[0], /padding:\s*0/);
  assert.match(tile[0], /border-radius:\s*0/);
  assert.match(tile[0], /border:\s*0/);
  const tileImg = css.match(/\.destination-tile img\s*\{[^}]*\}/);
  assert.ok(tileImg, "destination tile image rule exists");
  assert.match(tileImg[0], /width:\s*100%/);
  assert.match(tileImg[0], /height:\s*100%/);
  assert.match(tileImg[0], /object-fit:\s*cover/);
  assert.match(tileImg[0], /padding:\s*0/);
  assert.match(tileImg[0], /border-radius:\s*0/);
  assert.match(tileImg[0], /border:\s*0/);
  assert.doesNotMatch(tileImg[0], /max-height:\s*min\(/, "tile photos are not capped into an inset");
});
