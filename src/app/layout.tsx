import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { LocalBusinessJsonLd } from "@/components/LocalBusinessJsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackClicks } from "@/components/TrackClicks";
import { PRODUCTION_ORIGIN } from "@/lib/public";
import { getSite } from "@/lib/site";
import "./globals.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f7f4ec",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const host = (await headers()).get("host") ?? "";
  const description = [site.name, site.address, site.tagline].filter(Boolean).join(" · ");
  return {
    metadataBase: new URL(PRODUCTION_ORIGIN),
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description,
    robots: host.includes("workers.dev") ? { index: false, follow: false } : { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
    openGraph: {
      siteName: site.name,
      type: "website",
      images: [
        {
          url: "/photos/storefront.webp",
          width: 1110,
          height: 886,
          alt: "Exterior of Vinny's Bar & Grill at 705 W. Cross St.",
        },
      ],
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite();
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <LocalBusinessJsonLd />
        <TrackClicks />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader site={site} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
