import type { MetadataRoute } from "next";
import { PRODUCTION_ORIGIN } from "@/lib/public";

const PATHS = ["/", "/menu", "/events", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${PRODUCTION_ORIGIN}${path === "/" ? "/" : path}`,
    changeFrequency: "weekly",
  }));
}
