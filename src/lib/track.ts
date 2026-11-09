import "server-only";

const ALLOWED = new Set([
  "menu_view",
  "directions_click",
  "phone_click",
  "event_view",
  "party_inquiry_submit",
]);

export function allowedTrack(name: string): boolean {
  return ALLOWED.has(name);
}

export async function recordTrack(name: string): Promise<void> {
  if (!allowedTrack(name)) return;
  const createdAt = new Date().toISOString();
  if (process.env.VINNYS_SNAPSHOT === "1") {
    const { insertTrack } = await import("./d1-write");
    await insertTrack(name, createdAt);
    return;
  }
  const { getDb } = await import("./db");
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS track_events (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  db.prepare("INSERT INTO track_events (name, created_at) VALUES (?, ?)").run(name, createdAt);
}
