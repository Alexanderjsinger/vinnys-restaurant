import type { Metadata } from "next";
import { PRODUCTION_ORIGIN } from "@/lib/public";

const shareImage = {
  url: "/hero/meet-me.jpg",
  width: 1800,
  height: 1203,
  alt: "Friends at a restaurant table. Not a photo of the dining room.",
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
