import type { Metadata } from "next";
import { DEFAULT_PLACE_NAME } from "@/lib/brand";
import { PRODUCTION_ORIGIN } from "@/lib/public";

const shareImage = {
  url: "/photos/storefront.webp",
  width: 1110,
  height: 886,
  alt: `Exterior of ${DEFAULT_PLACE_NAME} at 705 W. Cross St.`,
};

export function pageMeta(path: string, title: string | { absolute: string }, description: string): Metadata {
  const canonical = `${PRODUCTION_ORIGIN}${path}`;
  const ogTitle = typeof title === "string" ? title : title.absolute;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      type: "website",
      images: [shareImage],
    },
  };
}
