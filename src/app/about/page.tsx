import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta("/about", "Our Story", "The story behind Vinny’s Bar & Grill: elevated food, reasonable prices, and a warm welcome for Ypsilanti and the EMU community.");

// Owner-provided original, preserved in docs/vinnys-story-source.md.
const STORY = [
  "Vinny’s Bar & Grill started with a simple idea: elevated food, reasonable prices, and a place where everyone feels welcome. We wanted to give our Ypsilanti neighbors and the Eastern Michigan University community a gathering spot they could call their own—somewhere to share a great meal, connect with friends, and come back often.",
  "That vision took shape as we transformed the former Wurst Bar space into a warm, inviting bar and grill with an easygoing atmosphere. With a chef bringing experience from Miami, our menu puts care and creativity into familiar favorites, complemented by thoughtfully made cocktails. Our goal is to make a great meal out something you can enjoy any day of the week.",
  "Whether you’re stopping in for lunch, meeting coworkers after work, settling in for dinner, or cheering on your team, there’s a seat for you here. We want you to return for the food and the way you’re treated—to feel recognized, welcomed, and happy you stopped by.",
  "Meet me at Vinny’s."
];

export default function AboutPage() {
  return (
    <>
      <section className="story-page-hero" aria-labelledby="story-page-heading">
        <div className="story-page-intro">
          <p className="micro-label">Our Story</p>
          <h1 id="story-page-heading">A place to call your own.</h1>
          <p>{STORY[0]}</p>
        </div>
        <figure className="story-page-photo">
          <img src="/photos/storefront-supplied.webp" alt="Vinny’s Bar & Grill at 705 W. Cross Street, Ypsilanti" width={1584} height={672} fetchPriority="high" />
        </figure>
      </section>
      <section className="story-kitchen" aria-label="Food at Vinny’s">
        <figure><img src="/photos/pizza-supplied.webp" alt="Pizza topped with greens" width={1600} height={1143} loading="lazy" /><figcaption>From the kitchen</figcaption></figure>
        <figure><img src="/photos/cheesecake-supplied.webp" alt="Cheesecake slice with berries and red sauce" width={1600} height={1200} loading="lazy" /><figcaption>Something sweet</figcaption></figure>
        <figure><img src="/photos/chocolate-dessert.webp" alt="Chocolate dessert with berries, mint, and red sauce" width={1080} height={1440} loading="lazy" /><figcaption>A sweet finish</figcaption></figure>
      </section>
      <section className="story-page-body wrap" aria-labelledby="story-welcome-heading">
        <p className="micro-label">Food, friends, and a warm welcome</p>
        <h2 id="story-welcome-heading">There’s a seat for you here.</h2>
        {STORY.slice(1, -1).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        <p className="story-signoff">{STORY[STORY.length - 1]}</p>
        <div className="story-page-actions">
          <Link className="btn btn-ink" href="/menu">Explore the menu</Link>
          <Link className="text-link" href="/contact">Plan your visit <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </>
  );
}
