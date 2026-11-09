import { LUNCH_MENU } from "./lunch-menu";
import { ORDER_URL, PHONE_DISPLAY } from "./public";
import { SETTING_KEYS, type EventRow, type Hour, type Inquiry, type MediaRow, type MenuSection, type PublishStatus, type SettingsMap } from "./types";

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<{ results?: T[] }>;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta?: { last_row_id?: number } }>;
};

type D1Database = {
  prepare(sql: string): D1Statement;
};

const HERO_TEXT =
  "A bar and grill across from EMU in Ypsilanti. Lunch is served daily, 11–3pm, from the printed menu.";

let ready: Promise<void> | null = null;

function asStatus(value: string | undefined): PublishStatus {
  if (value === "draft" || value === "archived") return value;
  return "published";
}

async function database(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  const db = (env as { DB?: D1Database }).DB;
  if (!db) throw new Error("D1 binding DB is missing.");
  return db;
}

async function addColumn(db: D1Database, sql: string) {
  try {
    await db.prepare(sql).run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/duplicate column/i.test(message)) throw error;
  }
}

async function ensure() {
  const db = await database();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        confirmed INTEGER NOT NULL DEFAULT 0
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS hours (
        id INTEGER PRIMARY KEY,
        label TEXT NOT NULL,
        opens TEXT NOT NULL,
        closes TEXT NOT NULL,
        confirmed INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        kind TEXT NOT NULL DEFAULT 'weekly',
        starts_on TEXT NOT NULL DEFAULT '',
        ends_on TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'published',
        updated_at TEXT NOT NULL DEFAULT '',
        published_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS menu_sections (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        blurb TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'published',
        updated_at TEXT NOT NULL DEFAULT '',
        published_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY,
        section_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_sample INTEGER NOT NULL DEFAULT 0,
        gluten_free INTEGER NOT NULL DEFAULT 0,
        marked INTEGER NOT NULL DEFAULT 0,
        available INTEGER NOT NULL DEFAULT 1,
        dietary TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'published',
        updated_at TEXT NOT NULL DEFAULT '',
        published_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        ends_at TEXT NOT NULL DEFAULT '',
        blurb TEXT NOT NULL DEFAULT '',
        is_sample INTEGER NOT NULL DEFAULT 0,
        price TEXT NOT NULL DEFAULT '',
        photo TEXT NOT NULL DEFAULT '',
        next_step TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'published',
        updated_at TEXT NOT NULL DEFAULT '',
        published_at TEXT NOT NULL DEFAULT ''
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS inquiries (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        event_date TEXT NOT NULL,
        party_size INTEGER NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`).run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY,
        object_key TEXT NOT NULL UNIQUE,
        alt TEXT NOT NULL,
        content_type TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS notify_queue (
        id INTEGER PRIMARY KEY,
        inquiry_id INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS rate_hits (
        id INTEGER PRIMARY KEY,
        bucket TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS track_events (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  for (const sql of [
    "ALTER TABLE hours ADD COLUMN kind TEXT NOT NULL DEFAULT 'weekly'",
    "ALTER TABLE hours ADD COLUMN starts_on TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE hours ADD COLUMN ends_on TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE hours ADD COLUMN status TEXT NOT NULL DEFAULT 'published'",
    "ALTER TABLE hours ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE hours ADD COLUMN published_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE events ADD COLUMN ends_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE events ADD COLUMN status TEXT NOT NULL DEFAULT 'published'",
    "ALTER TABLE events ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE events ADD COLUMN published_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE menu_items ADD COLUMN available INTEGER NOT NULL DEFAULT 1",
    "ALTER TABLE menu_items ADD COLUMN dietary TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE menu_items ADD COLUMN status TEXT NOT NULL DEFAULT 'published'",
    "ALTER TABLE menu_items ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE menu_items ADD COLUMN published_at TEXT NOT NULL DEFAULT ''",
  ]) {
    await addColumn(db, sql);
  }
  const seeded = await db.prepare("SELECT value FROM meta WHERE key = 'content_seed'").bind().first<{ value: string }>();
  if (seeded?.value === "1") return;
  const now = new Date().toISOString();
  const settings: [string, string, number][] = [
    ["restaurant_name", "Vinny's Bar & Grill", 0],
    ["tagline", "Good Food, Great Times", 0],
    ["address", "705 W. Cross St., Ypsilanti, MI 48197", 0],
    ["phone", PHONE_DISPLAY, 1],
    ["email", "", 0],
    ["notify_email", "alexander.jeffrey.singer@gmail.com", 0],
    ["owner_name", "", 0],
    ["opened_on", "", 0],
    ["former_venue", "", 0],
    ["cuisine_summary", "", 0],
    ["promo_headline", "", 0],
    ["promo_body", "", 0],
    ["promo_link_label", "", 0],
    ["promo_link_url", "", 0],
    ["toast_ordering_url", ORDER_URL, 0],
    ["reservation_provider", "none", 0],
    ["reservation_url", "", 0],
    ["hero_heading", "Vinny's Bar & Grill", 1],
    ["hero_text", HERO_TEXT, 1],
    ["hero_image", "", 0],
  ];
  for (const [key, value, confirmed] of settings) {
    await db
      .prepare(
        "INSERT INTO settings (key, value, confirmed) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING",
      )
      .bind(key, value, confirmed)
      .run();
  }
  const hourCount = await db.prepare("SELECT COUNT(*) AS n FROM hours").first<{ n: number }>();
  if ((hourCount?.n ?? 0) === 0) {
  const hours = [
    ["Sunday–Wednesday", "11:00", "23:00", 10],
    ["Thursday–Saturday", "11:00", "00:00", 20],
  ] as const;
  for (const [label, opens, closes, sort] of hours) {
    await db
      .prepare(
        `INSERT INTO hours (label, opens, closes, confirmed, sort_order, kind, status, updated_at, published_at)
         VALUES (?, ?, ?, 0, ?, 'weekly', 'published', ?, ?)`,
      )
      .bind(label, opens, closes, sort, now, now)
      .run();
  }
  }
  const sectionCount = await db.prepare("SELECT COUNT(*) AS n FROM menu_sections").first<{ n: number }>();
  if ((sectionCount?.n ?? 0) === 0) {
  for (const [sectionIndex, section] of LUNCH_MENU.entries()) {
    const inserted = await db
      .prepare(
        `INSERT INTO menu_sections (name, blurb, sort_order, status, updated_at, published_at)
         VALUES (?, ?, ?, 'published', ?, ?)`,
      )
      .bind(section.name, section.blurb, (sectionIndex + 1) * 10, now, now)
      .run();
    const sectionId = inserted.meta?.last_row_id;
    for (const [itemIndex, item] of section.items.entries()) {
      await db
        .prepare(
          `INSERT INTO menu_items
            (section_id, name, description, price, sort_order, is_sample, gluten_free, marked, available, status, updated_at, published_at)
           VALUES (?, ?, ?, ?, ?, 0, ?, ?, 1, 'published', ?, ?)`,
        )
        .bind(
          sectionId,
          item.name,
          item.description,
          item.price,
          (itemIndex + 1) * 10,
          item.glutenFree ? 1 : 0,
          item.marked ? 1 : 0,
          now,
          now,
        )
        .run();
    }
  }
  }
  await db
    .prepare("INSERT INTO meta (key, value) VALUES ('content_seed', '1') ON CONFLICT(key) DO UPDATE SET value = '1'")
    .run();
}

export function prepareD1() {
  if (!ready) {
    ready = ensure().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

function blankSettings(): SettingsMap {
  return Object.fromEntries(SETTING_KEYS.map((key) => [key, { value: "", confirmed: false }])) as SettingsMap;
}

export async function getSettings(): Promise<SettingsMap> {
  await prepareD1();
  const db = await database();
  const rows = await db.prepare("SELECT key, value, confirmed FROM settings").all<{
    key: string;
    value: string;
    confirmed: number;
  }>();
  const map = blankSettings();
  for (const row of rows.results ?? []) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
      map[row.key as keyof SettingsMap] = { value: row.value, confirmed: row.confirmed === 1 };
    }
  }
  return map;
}

export async function saveSetting(key: string, value: string, confirmed: boolean) {
  await prepareD1();
  const db = await database();
  await db
    .prepare(
      `INSERT INTO settings (key, value, confirmed) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, confirmed = excluded.confirmed`,
    )
    .bind(key, value, confirmed ? 1 : 0)
    .run();
}

function mapHour(row: {
  id: number;
  label: string;
  opens: string;
  closes: string;
  confirmed: number;
  sort_order: number;
  kind: string;
  starts_on: string;
  ends_on: string;
  status: string;
  updated_at: string;
  published_at: string;
}): Hour {
  return {
    id: row.id,
    label: row.label,
    opens: row.opens,
    closes: row.closes,
    confirmed: row.confirmed === 1,
    sort_order: row.sort_order,
    kind: row.kind === "holiday" ? "holiday" : "weekly",
    starts_on: row.starts_on ?? "",
    ends_on: row.ends_on ?? "",
    status: asStatus(row.status),
    updated_at: row.updated_at ?? "",
    published_at: row.published_at ?? "",
  };
}

export async function listHours(): Promise<Hour[]> {
  await prepareD1();
  const db = await database();
  const rows = await db
    .prepare(
      "SELECT id, label, opens, closes, confirmed, sort_order, kind, starts_on, ends_on, status, updated_at, published_at FROM hours ORDER BY sort_order, id",
    )
    .all<Parameters<typeof mapHour>[0]>();
  return (rows.results ?? []).map(mapHour);
}

export async function updateHour(row: {
  id: number;
  label: string;
  opens: string;
  closes: string;
  confirmed: boolean;
}) {
  await prepareD1();
  const db = await database();
  await db
    .prepare("UPDATE hours SET label = ?, opens = ?, closes = ?, confirmed = ?, updated_at = ? WHERE id = ?")
    .bind(row.label, row.opens, row.closes, row.confirmed ? 1 : 0, new Date().toISOString(), row.id)
    .run();
}

export async function addHour(label: string, opens: string, closes: string) {
  await prepareD1();
  const db = await database();
  const max = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM hours").first<{ m: number }>();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO hours (label, opens, closes, confirmed, sort_order, kind, status, updated_at, published_at)
       VALUES (?, ?, ?, 0, ?, 'weekly', 'published', ?, ?)`,
    )
    .bind(label, opens, closes, (max?.m ?? 0) + 10, now, now)
    .run();
}

export async function addHolidayHour(input: {
  label: string;
  opens: string;
  closes: string;
  startsOn: string;
  endsOn: string;
}) {
  await prepareD1();
  const db = await database();
  const max = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM hours").first<{ m: number }>();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO hours (label, opens, closes, confirmed, sort_order, kind, starts_on, ends_on, status, updated_at, published_at)
       VALUES (?, ?, ?, 1, ?, 'holiday', ?, ?, 'published', ?, ?)`,
    )
    .bind(input.label, input.opens, input.closes, (max?.m ?? 0) + 10, input.startsOn, input.endsOn, now, now)
    .run();
}

export async function deleteHour(id: number) {
  await prepareD1();
  const db = await database();
  await db.prepare("DELETE FROM hours WHERE id = ?").bind(id).run();
}

export async function moveHour(id: number, direction: "up" | "down") {
  const rows = await listHours();
  await reorder(rows, id, direction, async (rowId, sort) => {
    const db = await database();
    await db.prepare("UPDATE hours SET sort_order = ? WHERE id = ?").bind(sort, rowId).run();
  });
}

export async function listMenu(): Promise<MenuSection[]> {
  await prepareD1();
  const db = await database();
  const sections = await db
    .prepare("SELECT id, name, blurb, sort_order, status, updated_at, published_at FROM menu_sections ORDER BY sort_order, id")
    .all<{
      id: number;
      name: string;
      blurb: string;
      sort_order: number;
      status: string;
      updated_at: string;
      published_at: string;
    }>();
  const items = await db
    .prepare(
      `SELECT id, section_id, name, description, price, sort_order, is_sample, gluten_free, marked, available, dietary, status, updated_at, published_at
       FROM menu_items ORDER BY sort_order, id`,
    )
    .all<{
      id: number;
      section_id: number;
      name: string;
      description: string;
      price: string;
      sort_order: number;
      is_sample: number;
      gluten_free: number;
      marked: number;
      available: number;
      dietary: string;
      status: string;
      updated_at: string;
      published_at: string;
    }>();
  const itemRows = items.results ?? [];
  return (sections.results ?? []).map((section) => ({
    id: section.id,
    name: section.name,
    blurb: section.blurb,
    sort_order: section.sort_order,
    status: asStatus(section.status),
    updated_at: section.updated_at ?? "",
    published_at: section.published_at ?? "",
    items: itemRows
      .filter((item) => item.section_id === section.id)
      .map((item) => ({
        id: item.id,
        section_id: item.section_id,
        name: item.name,
        description: item.description,
        price: item.price,
        sort_order: item.sort_order,
        is_sample: item.is_sample === 1,
        gluten_free: item.gluten_free === 1,
        marked: item.marked === 1,
        available: item.available !== 0,
        dietary: item.dietary ?? "",
        status: asStatus(item.status),
        updated_at: item.updated_at ?? "",
        published_at: item.published_at ?? "",
      })),
  }));
}

export async function addSection(name: string, blurb: string) {
  await prepareD1();
  const db = await database();
  const max = await db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_sections").first<{ m: number }>();
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO menu_sections (name, blurb, sort_order, status, updated_at, published_at) VALUES (?, ?, ?, 'published', ?, ?)",
    )
    .bind(name, blurb, (max?.m ?? 0) + 10, now, now)
    .run();
}

export async function updateSection(id: number, name: string, blurb: string) {
  await prepareD1();
  const db = await database();
  await db
    .prepare("UPDATE menu_sections SET name = ?, blurb = ?, updated_at = ? WHERE id = ?")
    .bind(name, blurb, new Date().toISOString(), id)
    .run();
}

export async function deleteSection(id: number) {
  await prepareD1();
  const db = await database();
  await db.prepare("DELETE FROM menu_items WHERE section_id = ?").bind(id).run();
  await db.prepare("DELETE FROM menu_sections WHERE id = ?").bind(id).run();
}

export async function moveSection(id: number, direction: "up" | "down") {
  const menu = await listMenu();
  await reorder(menu, id, direction, async (rowId, sort) => {
    const db = await database();
    await db.prepare("UPDATE menu_sections SET sort_order = ? WHERE id = ?").bind(sort, rowId).run();
  });
}

export async function sectionExists(id: number): Promise<boolean> {
  await prepareD1();
  const db = await database();
  const row = await db.prepare("SELECT id FROM menu_sections WHERE id = ?").bind(id).first<{ id: number }>();
  return Boolean(row);
}

export async function addItem(input: {
  sectionId: number;
  name: string;
  description: string;
  price: string;
  isSample: boolean;
  glutenFree?: boolean;
  available?: boolean;
  dietary?: string;
  status?: PublishStatus;
}) {
  await prepareD1();
  const db = await database();
  const max = await db
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_items WHERE section_id = ?")
    .bind(input.sectionId)
    .first<{ m: number }>();
  const now = new Date().toISOString();
  const status = input.status ?? "published";
  await db
    .prepare(
      `INSERT INTO menu_items
        (section_id, name, description, price, sort_order, is_sample, gluten_free, marked, available, dietary, status, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.sectionId,
      input.name,
      input.description,
      input.price,
      (max?.m ?? 0) + 10,
      input.isSample ? 1 : 0,
      input.glutenFree ? 1 : 0,
      input.available === false ? 0 : 1,
      input.dietary ?? "",
      status,
      now,
      status === "published" ? now : "",
    )
    .run();
}

export async function updateItem(input: {
  id: number;
  sectionId: number;
  name: string;
  description: string;
  price: string;
  isSample: boolean;
  glutenFree?: boolean;
  available?: boolean;
  dietary?: string;
  status?: PublishStatus;
}) {
  await prepareD1();
  const db = await database();
  const current = await db
    .prepare("SELECT section_id, gluten_free, available, dietary, status, published_at, marked FROM menu_items WHERE id = ?")
    .bind(input.id)
    .first<{
      section_id: number;
      gluten_free: number;
      available: number;
      dietary: string;
      status: string;
      published_at: string;
      marked: number;
    }>();
  if (!current) return;
  const now = new Date().toISOString();
  const status = input.status ?? asStatus(current.status);
  const publishedAt = status === "published" ? current.published_at || now : current.published_at;
  let sort = 0;
  if (current.section_id !== input.sectionId) {
    const max = await db
      .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_items WHERE section_id = ?")
      .bind(input.sectionId)
      .first<{ m: number }>();
    sort = (max?.m ?? 0) + 10;
  }
  await db
    .prepare(
      `UPDATE menu_items
       SET section_id = ?, name = ?, description = ?, price = ?, is_sample = ?, gluten_free = ?, available = ?, dietary = ?, status = ?, updated_at = ?, published_at = ?,
           sort_order = CASE WHEN ? = 0 THEN sort_order ELSE ? END
       WHERE id = ?`,
    )
    .bind(
      input.sectionId,
      input.name,
      input.description,
      input.price,
      input.isSample ? 1 : 0,
      input.glutenFree === undefined ? current.gluten_free : input.glutenFree ? 1 : 0,
      input.available === undefined ? current.available : input.available ? 1 : 0,
      input.dietary === undefined ? current.dietary : input.dietary,
      status,
      now,
      publishedAt,
      sort,
      sort,
      input.id,
    )
    .run();
}

export async function deleteItem(id: number) {
  await prepareD1();
  const db = await database();
  await db.prepare("DELETE FROM menu_items WHERE id = ?").bind(id).run();
}

export async function moveItem(id: number, direction: "up" | "down") {
  await prepareD1();
  const db = await database();
  const current = await db.prepare("SELECT section_id FROM menu_items WHERE id = ?").bind(id).first<{ section_id: number }>();
  if (!current) return;
  const rows = await db
    .prepare("SELECT id, sort_order FROM menu_items WHERE section_id = ? ORDER BY sort_order, id")
    .bind(current.section_id)
    .all<{ id: number; sort_order: number }>();
  await reorder(rows.results ?? [], id, direction, async (rowId, sort) => {
    await db.prepare("UPDATE menu_items SET sort_order = ? WHERE id = ?").bind(sort, rowId).run();
  });
}

function mapEvent(row: {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  blurb: string;
  is_sample: number;
  price: string;
  photo: string;
  next_step: string;
  status: string;
  updated_at: string;
  published_at: string;
}): EventRow {
  return {
    id: row.id,
    title: row.title,
    starts_at: row.starts_at,
    ends_at: row.ends_at ?? "",
    blurb: row.blurb,
    is_sample: row.is_sample === 1,
    price: row.price ?? "",
    photo: row.photo ?? "",
    next_step: row.next_step ?? "",
    status: asStatus(row.status),
    updated_at: row.updated_at ?? "",
    published_at: row.published_at ?? "",
  };
}

export async function listEvents(): Promise<EventRow[]> {
  await prepareD1();
  const db = await database();
  const rows = await db
    .prepare(
      "SELECT id, title, starts_at, ends_at, blurb, is_sample, price, photo, next_step, status, updated_at, published_at FROM events ORDER BY starts_at, id",
    )
    .all<Parameters<typeof mapEvent>[0]>();
  return (rows.results ?? []).map(mapEvent);
}

export async function addEvent(input: {
  title: string;
  startsAt: string;
  endsAt?: string;
  blurb: string;
  isSample: boolean;
  price: string;
  photo: string;
  nextStep: string;
  status?: PublishStatus;
}) {
  await prepareD1();
  const db = await database();
  const now = new Date().toISOString();
  const status = input.status ?? "published";
  await db
    .prepare(
      `INSERT INTO events
        (title, starts_at, ends_at, blurb, is_sample, price, photo, next_step, status, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      input.title,
      input.startsAt,
      input.endsAt ?? "",
      input.blurb,
      input.isSample ? 1 : 0,
      input.price,
      input.photo,
      input.nextStep,
      status,
      now,
      status === "published" ? now : "",
    )
    .run();
}

export async function updateEvent(input: {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string;
  blurb: string;
  isSample: boolean;
  price: string;
  photo: string;
  nextStep: string;
  status?: PublishStatus;
}) {
  await prepareD1();
  const db = await database();
  const current = await db
    .prepare("SELECT status, published_at FROM events WHERE id = ?")
    .bind(input.id)
    .first<{ status: string; published_at: string }>();
  if (!current) return;
  const now = new Date().toISOString();
  const status = input.status ?? asStatus(current.status);
  const publishedAt = status === "published" ? current.published_at || now : current.published_at;
  await db
    .prepare(
      `UPDATE events
       SET title = ?, starts_at = ?, ends_at = ?, blurb = ?, is_sample = ?, price = ?, photo = ?, next_step = ?, status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
    )
    .bind(
      input.title,
      input.startsAt,
      input.endsAt ?? "",
      input.blurb,
      input.isSample ? 1 : 0,
      input.price,
      input.photo,
      input.nextStep,
      status,
      now,
      publishedAt,
      input.id,
    )
    .run();
}

export async function deleteEvent(id: number) {
  await prepareD1();
  const db = await database();
  await db.prepare("DELETE FROM events WHERE id = ?").bind(id).run();
}

export async function listInquiries(): Promise<Inquiry[]> {
  await prepareD1();
  const db = await database();
  const rows = await db
    .prepare(
      "SELECT id, name, email, event_date, party_size, message, created_at FROM inquiries ORDER BY created_at DESC, id DESC",
    )
    .all<Inquiry>();
  return rows.results ?? [];
}

export async function addInquiry(input: {
  name: string;
  email: string;
  eventDate: string;
  partySize: number;
  message: string;
}): Promise<number> {
  await prepareD1();
  const db = await database();
  const createdAt = new Date().toISOString();
  const result = await db
    .prepare(
      "INSERT INTO inquiries (name, email, event_date, party_size, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(input.name, input.email, input.eventDate, input.partySize, input.message, createdAt)
    .run();
  return Number(result.meta?.last_row_id ?? 0);
}

export async function deleteInquiry(id: number) {
  await prepareD1();
  const db = await database();
  await db.prepare("DELETE FROM inquiries WHERE id = ?").bind(id).run();
}

export async function listSignups() {
  await prepareD1();
  const db = await database();
  const rows = await db
    .prepare("SELECT id, email, created_at FROM signups ORDER BY created_at DESC, id DESC")
    .all<{ id: number; email: string; created_at: string }>();
  return rows.results ?? [];
}

export async function allowRate(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  await prepareD1();
  const db = await database();
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  await db.prepare("DELETE FROM rate_hits WHERE created_at < ?").bind(cutoff).run();
  const count = await db
    .prepare("SELECT COUNT(*) AS n FROM rate_hits WHERE bucket = ?")
    .bind(bucket)
    .first<{ n: number }>();
  if ((count?.n ?? 0) >= limit) return false;
  await db.prepare("INSERT INTO rate_hits (bucket, created_at) VALUES (?, ?)").bind(bucket, new Date().toISOString()).run();
  return true;
}

export async function enqueueNotify(inquiryId: number, reason: string) {
  await prepareD1();
  const db = await database();
  await db
    .prepare("INSERT INTO notify_queue (inquiry_id, reason, created_at) VALUES (?, ?, ?)")
    .bind(inquiryId, reason, new Date().toISOString())
    .run();
}

export async function listMedia(): Promise<MediaRow[]> {
  await prepareD1();
  const db = await database();
  const rows = await db
    .prepare("SELECT id, object_key, alt, content_type, bytes, created_at FROM media ORDER BY id DESC")
    .all<MediaRow>();
  return rows.results ?? [];
}

export async function addMedia(input: Omit<MediaRow, "id">): Promise<number> {
  await prepareD1();
  const db = await database();
  const result = await db
    .prepare("INSERT INTO media (object_key, alt, content_type, bytes, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(input.object_key, input.alt, input.content_type, input.bytes, input.created_at)
    .run();
  return Number(result.meta?.last_row_id ?? 0);
}

export async function getMedia(id: number): Promise<MediaRow | null> {
  await prepareD1();
  const db = await database();
  return db
    .prepare("SELECT id, object_key, alt, content_type, bytes, created_at FROM media WHERE id = ?")
    .bind(id)
    .first<MediaRow>();
}

async function reorder(
  rows: { id: number; sort_order: number }[],
  id: number,
  direction: "up" | "down",
  write: (id: number, sort: number) => Promise<void>,
) {
  const index = rows.findIndex((row) => row.id === id);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= rows.length) return;
  const current = rows[index];
  const other = rows[swap];
  await write(current.id, other.sort_order);
  await write(other.id, current.sort_order);
}
