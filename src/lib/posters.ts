import "server-only";
import fs from "fs";
import path from "path";

const IMAGE_EXT = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

export type EventPoster = {
  src: string;
  alt: string;
};

export function listEventPosters(): EventPoster[] {
  try {
    const dir = path.join(process.cwd(), "public", "events");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()) && !name.startsWith("."))
      .sort((a, b) => a.localeCompare(b, "en"))
      .map((name) => ({
        src: `/events/${encodeURIComponent(name)}`,
        alt: "Event poster",
      }));
  } catch {
    return [];
  }
}
