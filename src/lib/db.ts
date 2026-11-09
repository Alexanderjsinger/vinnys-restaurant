import "server-only";
import fs from "fs";
import path from "path";
import { createRequire } from "node:module";
import type Database from "better-sqlite3";
import { LUNCH_MENU, LUNCH_PROMO_BODY, PREVIOUS_PROMO_BODY } from "./lunch-menu";
import { ORDER_URL, PHONE_DISPLAY } from "./public";
import {
  SETTING_KEYS,
  type EventRow,
  type Hour,
  type Inquiry,
  type MenuItem,
  type MenuSection,
  type PublishStatus,
  type SettingKey,
  type SettingsMap,
} from "./types";

type SettingRow = { key: string; value: string; confirmed: number };
type HourRow = {
  id: number;
  label: string;
  opens: string;
  closes: string;
  confirmed: number;
  sort_order: number;
};
type SectionRow = { id: number; name: string; blurb: string; sort_order: number };
type ItemRow = {
  id: number;
  section_id: number;
  name: string;
  description: string;
  price: string;
  sort_order: number;
  is_sample: number;
  gluten_free: number;
  marked: number;
};
type EventDbRow = {
  id: number;
  title: string;
  starts_at: string;
  blurb: string;
  is_sample: number;
  price: string;
  photo: string;
  next_step: string;
};

const globalForDb = globalThis as unknown as { vinnysDb?: Database.Database };
const nodeRequire = createRequire(import.meta.url);

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      confirmed INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS hours (
      id INTEGER PRIMARY KEY,
      label TEXT NOT NULL,
      opens TEXT NOT NULL,
      closes TEXT NOT NULL,
      confirmed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS menu_sections (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      blurb TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY,
      section_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      is_sample INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (section_id) REFERENCES menu_sections(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      blurb TEXT NOT NULL,
      is_sample INTEGER NOT NULL DEFAULT 0,
      price TEXT NOT NULL DEFAULT '',
      photo TEXT NOT NULL DEFAULT '',
      next_step TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      event_date TEXT NOT NULL,
      party_size INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  ensureMenuColumns(db);
  ensureEventColumns(db);
  ensureContentColumns(db);
  ensureExtraSettings(db);

  const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get() as
    | { value: string }
    | undefined;
  if (seeded?.value === "1") {
    replaceLunchMenu(db);
    confirmKnownFacts(db);
    return;
  }

  const insertSetting = db.prepare(
    "INSERT INTO settings (key, value, confirmed) VALUES (?, ?, 0)",
  );
  const settings: [SettingKey, string][] = [
    ["restaurant_name", "Vinny's Bar & Grill"],
    ["tagline", "Good Food, Great Times"],
    ["address", "705 W. Cross St., Ypsilanti, MI 48197"],
    ["phone", PHONE_DISPLAY],
    ["email", ""],
    ["owner_name", "Vince Ankawi"],
    ["opened_on", "2026-10-02"],
    ["former_venue", "Wurst Bar"],
    ["cuisine_summary", "Elevated fresh lunch and dinner: burgers, salads, soups, seafood, vegetarian. EMU / sports crowd."],
    ["promo_headline", "Good Food, Great Times"],
    ["promo_body", LUNCH_PROMO_BODY],
    ["promo_link_label", ""],
    ["promo_link_url", ""],
    ["toast_ordering_url", ORDER_URL],
    ["reservation_provider", "none"],
    ["reservation_url", ""],
  ];

  const seed = db.transaction(() => {
    for (const [key, value] of settings) insertSetting.run(key, value);
    const insertHour = db.prepare(
      "INSERT INTO hours (label, opens, closes, confirmed, sort_order) VALUES (?, ?, ?, 0, ?)",
    );
    insertHour.run("Sunday–Wednesday", "11:00", "23:00", 10);
    insertHour.run("Thursday–Saturday", "11:00", "00:00", 20);

    insertLunchMenu(db);

    const insertEvent = db.prepare(
      "INSERT INTO events (title, starts_at, blurb, is_sample) VALUES (?, ?, ?, 1)",
    );
    insertEvent.run(
      "Sample: Thursday night",
      "2026-11-21T19:00",
      "Placeholder event so this page is not empty. Not a real booking at Vinny’s.",
    );
    insertEvent.run(
      "Sample: weekend gathering",
      "2026-11-28T16:00",
      "Placeholder event so this page is not empty. Not a real booking at Vinny’s.",
    );
    insertEvent.run(
      "Sample: private hold",
      "2026-12-05T18:00",
      "Placeholder event so this page is not empty. Not a real booking at Vinny’s.",
    );

    db.prepare("INSERT INTO meta (key, value) VALUES ('seeded', '1')").run();
    db.prepare("INSERT INTO meta (key, value) VALUES ('menu_version', '2')").run();
  });
  seed();
  confirmKnownFacts(db);
}

function confirmKnownFacts(db: Database.Database) {
  const phone = db.prepare("SELECT value FROM settings WHERE key = 'phone'").get() as
    | { value: string }
    | undefined;
  const digits = (phone?.value ?? "").replace(/\D/g, "");
  if (!digits || digits === "7349057051" || digits === "17349057051") {
    db.prepare("UPDATE settings SET value = ?, confirmed = 1 WHERE key = 'phone'").run(PHONE_DISPLAY);
  }
}

function ensureEventColumns(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(events)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("price")) db.exec("ALTER TABLE events ADD COLUMN price TEXT NOT NULL DEFAULT ''");
  if (!names.has("photo")) db.exec("ALTER TABLE events ADD COLUMN photo TEXT NOT NULL DEFAULT ''");
  if (!names.has("next_step")) db.exec("ALTER TABLE events ADD COLUMN next_step TEXT NOT NULL DEFAULT ''");
}

function addColumn(db: Database.Database, table: string, name: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!columns.some((column) => column.name === name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  }
}

function ensureContentColumns(db: Database.Database) {
  addColumn(db, "hours", "kind", "TEXT NOT NULL DEFAULT 'weekly'");
  addColumn(db, "hours", "starts_on", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "hours", "ends_on", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "hours", "status", "TEXT NOT NULL DEFAULT 'published'");
  addColumn(db, "hours", "updated_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "hours", "published_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "menu_sections", "status", "TEXT NOT NULL DEFAULT 'published'");
  addColumn(db, "menu_sections", "updated_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "menu_sections", "published_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "menu_items", "available", "INTEGER NOT NULL DEFAULT 1");
  addColumn(db, "menu_items", "dietary", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "menu_items", "status", "TEXT NOT NULL DEFAULT 'published'");
  addColumn(db, "menu_items", "updated_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "menu_items", "published_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "events", "ends_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "events", "status", "TEXT NOT NULL DEFAULT 'published'");
  addColumn(db, "events", "updated_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "events", "published_at", "TEXT NOT NULL DEFAULT ''");
  db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY,
      object_key TEXT NOT NULL UNIQUE,
      alt TEXT NOT NULL,
      content_type TEXT NOT NULL,
      bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notify_queue (
      id INTEGER PRIMARY KEY,
      inquiry_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_attempt_at TEXT NOT NULL DEFAULT '',
      sent_at TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rate_hits (
      id INTEGER PRIMARY KEY,
      bucket TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  addColumn(db, "notify_queue", "status", "TEXT NOT NULL DEFAULT 'pending'");
  addColumn(db, "notify_queue", "attempts", "INTEGER NOT NULL DEFAULT 0");
  addColumn(db, "notify_queue", "last_attempt_at", "TEXT NOT NULL DEFAULT ''");
  addColumn(db, "notify_queue", "sent_at", "TEXT NOT NULL DEFAULT ''");
}

function ensureExtraSettings(db: Database.Database) {
  const insert = db.prepare("INSERT OR IGNORE INTO settings (key, value, confirmed) VALUES (?, ?, ?)");
  const rows: [string, string, number][] = [
    ["notify_email", "alexander.jeffrey.singer@gmail.com", 0],
    ["hero_heading", "Vinny's Bar & Grill", 1],
    ["hero_text", "A bar and grill across from EMU in Ypsilanti. Lunch is served daily, 11–3pm, from the printed menu.", 1],
    ["hero_image", "", 0],
  ];
  for (const row of rows) insert.run(row[0], row[1], row[2]);
}

function ensureMenuColumns(db: Database.Database) {
  const columns = db.prepare("PRAGMA table_info(menu_items)").all() as { name: string }[];
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("gluten_free")) {
    db.exec("ALTER TABLE menu_items ADD COLUMN gluten_free INTEGER NOT NULL DEFAULT 0");
  }
  if (!names.has("marked")) {
    db.exec("ALTER TABLE menu_items ADD COLUMN marked INTEGER NOT NULL DEFAULT 0");
  }
}

function insertLunchMenu(db: Database.Database) {
  const insertSection = db.prepare(
    "INSERT INTO menu_sections (name, blurb, sort_order) VALUES (?, ?, ?)",
  );
  const insertItem = db.prepare(
    `INSERT INTO menu_items
      (section_id, name, description, price, sort_order, is_sample, gluten_free, marked)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
  );
  LUNCH_MENU.forEach((section, sectionIndex) => {
    const sectionId = Number(
      insertSection.run(section.name, section.blurb, (sectionIndex + 1) * 10).lastInsertRowid,
    );
    section.items.forEach((item, itemIndex) => {
      insertItem.run(
        sectionId,
        item.name,
        item.description,
        item.price,
        (itemIndex + 1) * 10,
        item.glutenFree ? 1 : 0,
        item.marked ? 1 : 0,
      );
    });
  });
}

function replaceLunchMenu(db: Database.Database) {
  const version = db.prepare("SELECT value FROM meta WHERE key = 'menu_version'").get() as
    | { value: string }
    | undefined;
  if (version?.value === "2") return;
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM menu_items").run();
    db.prepare("DELETE FROM menu_sections").run();
    insertLunchMenu(db);
    const promo = db.prepare("SELECT value FROM settings WHERE key = 'promo_body'").get() as
      | { value: string }
      | undefined;
    if (promo?.value === PREVIOUS_PROMO_BODY) {
      db.prepare("UPDATE settings SET value = ? WHERE key = 'promo_body'").run(LUNCH_PROMO_BODY);
    }
    db.prepare(
      `INSERT INTO meta (key, value) VALUES ('menu_version', '2')
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run();
  });
  tx();
}

export function getDb(): Database.Database {
  if (!globalForDb.vinnysDb) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const imported = nodeRequire("better-sqlite3") as
      | typeof import("better-sqlite3")
      | { default: typeof import("better-sqlite3") };
    const Sqlite = typeof imported === "function" ? imported : imported.default;
    const db = new Sqlite(path.join(dir, "site.sqlite"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 4000");
    migrate(db);
    globalForDb.vinnysDb = db;
  }
  return globalForDb.vinnysDb;
}

export function getSettings(): SettingsMap {
  const rows = getDb().prepare("SELECT key, value, confirmed FROM settings").all() as SettingRow[];
  const map = Object.fromEntries(
    SETTING_KEYS.map((key) => [key, { value: "", confirmed: false }]),
  ) as SettingsMap;
  for (const row of rows) {
    if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
      map[row.key as SettingKey] = { value: row.value, confirmed: row.confirmed === 1 };
    }
  }
  return map;
}

export function saveSetting(key: SettingKey, value: string, confirmed: boolean) {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value, confirmed) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, confirmed = excluded.confirmed`,
    )
    .run(key, value, confirmed ? 1 : 0);
}

function asStatus(value: string | undefined): PublishStatus {
  if (value === "draft" || value === "archived") return value;
  return "published";
}

function mapHour(row: HourRow & Partial<ContentCols>): Hour {
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

type ContentCols = {
  kind?: string;
  starts_on?: string;
  ends_on?: string;
  status?: string;
  updated_at?: string;
  published_at?: string;
  available?: number;
  dietary?: string;
  ends_at?: string;
};

export function listHours(): Hour[] {
  const rows = getDb()
    .prepare(
      "SELECT id, label, opens, closes, confirmed, sort_order, kind, starts_on, ends_on, status, updated_at, published_at FROM hours ORDER BY sort_order, id",
    )
    .all() as Array<HourRow & ContentCols>;
  return rows.map(mapHour);
}

export function updateHour(row: {
  id: number;
  label: string;
  opens: string;
  closes: string;
  confirmed: boolean;
}) {
  getDb()
    .prepare("UPDATE hours SET label = ?, opens = ?, closes = ?, confirmed = ? WHERE id = ?")
    .run(row.label, row.opens, row.closes, row.confirmed ? 1 : 0, row.id);
}

export function addHour(label: string, opens: string, closes: string) {
  const max = getDb().prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM hours").get() as { m: number };
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO hours (label, opens, closes, confirmed, sort_order, kind, starts_on, ends_on, status, updated_at, published_at)
       VALUES (?, ?, ?, 0, ?, 'weekly', '', '', 'published', ?, ?)`,
    )
    .run(label, opens, closes, max.m + 10, now, now);
}

export function addHolidayHour(input: {
  label: string;
  opens: string;
  closes: string;
  startsOn: string;
  endsOn: string;
}) {
  const max = getDb().prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM hours").get() as { m: number };
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO hours (label, opens, closes, confirmed, sort_order, kind, starts_on, ends_on, status, updated_at, published_at)
       VALUES (?, ?, ?, 1, ?, 'holiday', ?, ?, 'published', ?, ?)`,
    )
    .run(input.label, input.opens, input.closes, max.m + 10, input.startsOn, input.endsOn, now, now);
}

export function deleteHour(id: number) {
  getDb().prepare("DELETE FROM hours WHERE id = ?").run(id);
}

export function moveHour(id: number, direction: "up" | "down") {
  const rows = listHours();
  reorder(rows, id, direction, (rowId, sort) => {
    getDb().prepare("UPDATE hours SET sort_order = ? WHERE id = ?").run(sort, rowId);
  });
}

export function listMenu(): MenuSection[] {
  const db = getDb();
  const sections = db
    .prepare(
      "SELECT id, name, blurb, sort_order, status, updated_at, published_at FROM menu_sections ORDER BY sort_order, id",
    )
    .all() as Array<SectionRow & ContentCols>;
  const items = db
    .prepare(
      `SELECT id, section_id, name, description, price, sort_order, is_sample, gluten_free, marked,
              available, dietary, status, updated_at, published_at
       FROM menu_items ORDER BY sort_order, id`,
    )
    .all() as Array<ItemRow & ContentCols>;
  return sections.map((section) => ({
    id: section.id,
    name: section.name,
    blurb: section.blurb,
    sort_order: section.sort_order,
    status: asStatus(section.status),
    updated_at: section.updated_at ?? "",
    published_at: section.published_at ?? "",
    items: items
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

export function addSection(name: string, blurb: string) {
  const max = getDb()
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_sections")
    .get() as { m: number };
  getDb()
    .prepare("INSERT INTO menu_sections (name, blurb, sort_order) VALUES (?, ?, ?)")
    .run(name, blurb, max.m + 10);
}

export function updateSection(id: number, name: string, blurb: string) {
  getDb().prepare("UPDATE menu_sections SET name = ?, blurb = ? WHERE id = ?").run(name, blurb, id);
}

export function deleteSection(id: number) {
  getDb().prepare("DELETE FROM menu_sections WHERE id = ?").run(id);
}

export function moveSection(id: number, direction: "up" | "down") {
  const rows = getDb()
    .prepare("SELECT id, sort_order FROM menu_sections ORDER BY sort_order, id")
    .all() as { id: number; sort_order: number }[];
  reorder(rows, id, direction, (rowId, sort) => {
    getDb().prepare("UPDATE menu_sections SET sort_order = ? WHERE id = ?").run(sort, rowId);
  });
}

export function addItem(input: {
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
  const max = getDb()
    .prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_items WHERE section_id = ?")
    .get(input.sectionId) as { m: number };
  const now = new Date().toISOString();
  const status = input.status ?? "published";
  getDb()
    .prepare(
      `INSERT INTO menu_items
        (section_id, name, description, price, sort_order, is_sample, gluten_free, available, dietary, status, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.sectionId,
      input.name,
      input.description,
      input.price,
      max.m + 10,
      input.isSample ? 1 : 0,
      input.glutenFree ? 1 : 0,
      input.available === false ? 0 : 1,
      input.dietary ?? "",
      status,
      now,
      status === "published" ? now : "",
    );
}

export function updateItem(input: {
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
  const db = getDb();
  const current = db
    .prepare("SELECT section_id, gluten_free, available, dietary, status, published_at FROM menu_items WHERE id = ?")
    .get(input.id) as
    | {
        section_id: number;
        gluten_free: number;
        available: number;
        dietary: string;
        status: string;
        published_at: string;
      }
    | undefined;
  if (!current) return;
  const now = new Date().toISOString();
  const status = input.status ?? asStatus(current.status);
  const publishedAt = status === "published" ? current.published_at || now : current.published_at;
  const gluten = input.glutenFree === undefined ? current.gluten_free : input.glutenFree ? 1 : 0;
  const available = input.available === undefined ? current.available : input.available ? 1 : 0;
  const dietary = input.dietary === undefined ? current.dietary : input.dietary;
  const sort =
    current.section_id === input.sectionId
      ? null
      : ((
          db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM menu_items WHERE section_id = ?").get(input.sectionId) as {
            m: number;
          }
        ).m + 10);
  if (sort === null) {
    db.prepare(
      `UPDATE menu_items
       SET name = ?, description = ?, price = ?, is_sample = ?, gluten_free = ?, available = ?, dietary = ?, status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
    ).run(input.name, input.description, input.price, input.isSample ? 1 : 0, gluten, available, dietary, status, now, publishedAt, input.id);
    return;
  }
  db.prepare(
    `UPDATE menu_items
     SET section_id = ?, name = ?, description = ?, price = ?, is_sample = ?, gluten_free = ?, available = ?, dietary = ?, status = ?, sort_order = ?, updated_at = ?, published_at = ?
     WHERE id = ?`,
  ).run(
    input.sectionId,
    input.name,
    input.description,
    input.price,
    input.isSample ? 1 : 0,
    gluten,
    available,
    dietary,
    status,
    sort,
    now,
    publishedAt,
    input.id,
  );
}

export function deleteItem(id: number) {
  getDb().prepare("DELETE FROM menu_items WHERE id = ?").run(id);
}

export function moveItem(id: number, direction: "up" | "down") {
  const current = getDb().prepare("SELECT section_id FROM menu_items WHERE id = ?").get(id) as
    | { section_id: number }
    | undefined;
  if (!current) return;
  const rows = getDb()
    .prepare(
      "SELECT id, sort_order FROM menu_items WHERE section_id = ? ORDER BY sort_order, id",
    )
    .all(current.section_id) as { id: number; sort_order: number }[];
  reorder(rows, id, direction, (rowId, sort) => {
    getDb().prepare("UPDATE menu_items SET sort_order = ? WHERE id = ?").run(sort, rowId);
  });
}

function asEvent(row: EventDbRow & ContentCols): EventRow {
  return {
    id: row.id,
    title: row.title,
    starts_at: row.starts_at,
    ends_at: row.ends_at ?? "",
    blurb: row.blurb,
    is_sample: Boolean(row.is_sample),
    price: row.price ?? "",
    photo: row.photo ?? "",
    next_step: row.next_step ?? "",
    status: asStatus(row.status),
    updated_at: row.updated_at ?? "",
    published_at: row.published_at ?? "",
  };
}

export function listEvents(): EventRow[] {
  const rows = getDb()
    .prepare(
      "SELECT id, title, starts_at, ends_at, blurb, is_sample, price, photo, next_step, status, updated_at, published_at FROM events ORDER BY starts_at, id",
    )
    .all() as EventDbRow[];
  return rows.map((row) => asEvent(row));
}

export function addEvent(input: {
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
  const now = new Date().toISOString();
  const status = input.status ?? "published";
  getDb()
    .prepare(
      `INSERT INTO events
        (title, starts_at, ends_at, blurb, is_sample, price, photo, next_step, status, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
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
    );
}

export function updateEvent(input: {
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
  const current = getDb().prepare("SELECT status, published_at FROM events WHERE id = ?").get(input.id) as
    | { status: string; published_at: string }
    | undefined;
  if (!current) return;
  const now = new Date().toISOString();
  const status = input.status ?? asStatus(current.status);
  const publishedAt = status === "published" ? current.published_at || now : current.published_at;
  getDb()
    .prepare(
      `UPDATE events
       SET title = ?, starts_at = ?, ends_at = ?, blurb = ?, is_sample = ?, price = ?, photo = ?, next_step = ?, status = ?, updated_at = ?, published_at = ?
       WHERE id = ?`,
    )
    .run(
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
    );
}

export function deleteEvent(id: number) {
  getDb().prepare("DELETE FROM events WHERE id = ?").run(id);
}

export function listInquiries(): Inquiry[] {
  return getDb()
    .prepare(
      "SELECT id, name, email, event_date, party_size, message, created_at FROM inquiries ORDER BY created_at DESC, id DESC",
    )
    .all() as Inquiry[];
}

export async function addInquiry(input: {
  name: string;
  email: string;
  eventDate: string;
  partySize: number;
  message: string;
}): Promise<number> {
  const createdAt = new Date().toISOString();
  const result = getDb()
    .prepare(
      "INSERT INTO inquiries (name, email, event_date, party_size, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      input.name,
      input.email,
      input.eventDate,
      input.partySize,
      input.message,
      createdAt,
    );
  return Number(result.lastInsertRowid);
}

export function deleteInquiry(id: number) {
  getDb().prepare("DELETE FROM inquiries WHERE id = ?").run(id);
}

export type Signup = {
  id: number;
  email: string;
  created_at: string;
};

export async function addSignup(email: string) {
  const createdAt = new Date().toISOString();
  getDb().prepare("INSERT INTO signups (email, created_at) VALUES (?, ?)").run(email, createdAt);
}

export function listSignups(): Signup[] {
  return getDb()
    .prepare("SELECT id, email, created_at FROM signups ORDER BY created_at DESC, id DESC")
    .all() as Signup[];
}

export function allowRate(bucket: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const db = getDb();
  db.prepare("DELETE FROM rate_hits WHERE created_at < ?").run(new Date(now - windowMs).toISOString());
  const count = db.prepare("SELECT COUNT(*) AS n FROM rate_hits WHERE bucket = ?").get(bucket) as { n: number };
  if (count.n >= limit) return false;
  db.prepare("INSERT INTO rate_hits (bucket, created_at) VALUES (?, ?)").run(bucket, new Date(now).toISOString());
  return true;
}

function asNotifyStatus(value: string | undefined): import("./types").NotifyStatus {
  if (value === "sent" || value === "failed") return value;
  return "pending";
}

export function enqueueNotify(inquiryId: number, reason: string) {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db
    .prepare(
      "SELECT id FROM notify_queue WHERE inquiry_id = ? AND status IN ('pending', 'failed') ORDER BY id DESC LIMIT 1",
    )
    .get(inquiryId) as { id: number } | undefined;
  if (existing) {
    db.prepare("UPDATE notify_queue SET reason = ?, status = 'pending' WHERE id = ?").run(reason.slice(0, 200), existing.id);
    return;
  }
  const sent = db
    .prepare("SELECT id FROM notify_queue WHERE inquiry_id = ? AND status = 'sent' LIMIT 1")
    .get(inquiryId) as { id: number } | undefined;
  if (sent) return;
  db.prepare(
    "INSERT INTO notify_queue (inquiry_id, reason, status, attempts, last_attempt_at, sent_at, created_at) VALUES (?, ?, 'pending', 0, '', '', ?)",
  ).run(inquiryId, reason.slice(0, 200), now);
}

export function markNotifyAttempt(queueId: number) {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare("UPDATE notify_queue SET attempts = attempts + 1, last_attempt_at = ? WHERE id = ?").run(now, queueId);
}

export function recordNotifyFailure(queueId: number, reason: string) {
  const db = getDb();
  const row = db.prepare("SELECT attempts FROM notify_queue WHERE id = ?").get(queueId) as { attempts: number };
  const status = (row?.attempts ?? 0) >= 5 ? "failed" : "pending";
  db.prepare("UPDATE notify_queue SET reason = ?, status = ? WHERE id = ? AND status != 'sent'").run(
    reason.slice(0, 200),
    status,
    queueId,
  );
}

export function markNotifySent(inquiryId: number, reason = "accepted-by-resend") {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE notify_queue SET status = 'sent', reason = ?, sent_at = ?, last_attempt_at = ? WHERE inquiry_id = ? AND status != 'sent'",
  ).run(reason.slice(0, 200), now, now, inquiryId);
  const existing = db
    .prepare("SELECT id FROM notify_queue WHERE inquiry_id = ? AND status = 'sent' LIMIT 1")
    .get(inquiryId) as { id: number } | undefined;
  if (!existing) {
    db.prepare(
      "INSERT INTO notify_queue (inquiry_id, reason, status, attempts, last_attempt_at, sent_at, created_at) VALUES (?, ?, 'sent', 1, ?, ?, ?)",
    ).run(inquiryId, reason.slice(0, 200), now, now, now);
  }
}

export function getInquiryNotifyStatus(inquiryId: number): import("./types").NotifyQueueRow | null {
  const row = getDb()
    .prepare(
      "SELECT id, inquiry_id, reason, status, attempts, last_attempt_at, sent_at, created_at FROM notify_queue WHERE inquiry_id = ? ORDER BY CASE status WHEN 'sent' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, id DESC LIMIT 1",
    )
    .get(inquiryId) as import("./types").NotifyQueueRow | undefined;
  if (!row) return null;
  return { ...row, status: asNotifyStatus(row.status) };
}

export function listPendingNotifies(limit = 20): import("./types").NotifyQueueJoin[] {
  const rows = getDb()
    .prepare(
      `SELECT q.id, q.inquiry_id, q.reason, q.status, q.attempts, q.last_attempt_at, q.sent_at, q.created_at,
              i.name, i.email, i.event_date, i.party_size, i.message
       FROM notify_queue q
       JOIN inquiries i ON i.id = q.inquiry_id
       WHERE q.status IN ('pending', 'failed')
       ORDER BY q.id ASC
       LIMIT ?`,
    )
    .all(limit) as import("./types").NotifyQueueJoin[];
  return rows.map((row) => ({ ...row, status: asNotifyStatus(row.status) }));
}

export function mediaInUse(id: number): boolean {
  const needle = `/media/${id}`;
  const setting = getDb().prepare("SELECT value FROM settings WHERE key = 'hero_image'").get() as
    | { value: string }
    | undefined;
  if (setting?.value?.includes(needle)) return true;
  const event = getDb()
    .prepare("SELECT id FROM events WHERE photo LIKE ? LIMIT 1")
    .get(`%${needle}%`) as { id: number } | undefined;
  return Boolean(event);
}

export function deleteMedia(id: number): { ok: true; object_key: string } | { ok: false; reason: string } {
  if (mediaInUse(id)) return { ok: false, reason: "in-use" };
  const db = getDb();
  const row = db.prepare("SELECT object_key FROM media WHERE id = ?").get(id) as { object_key: string } | undefined;
  if (!row) return { ok: false, reason: "missing" };
  db.prepare("DELETE FROM media WHERE id = ?").run(id);
  return { ok: true, object_key: row.object_key };
}

export function listMedia(): import("./types").MediaRow[] {
  return getDb()
    .prepare("SELECT id, object_key, alt, content_type, bytes, created_at FROM media ORDER BY id DESC")
    .all() as import("./types").MediaRow[];
}

export function addMedia(input: Omit<import("./types").MediaRow, "id">): number {
  const result = getDb()
    .prepare("INSERT INTO media (object_key, alt, content_type, bytes, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(input.object_key, input.alt, input.content_type, input.bytes, input.created_at);
  return Number(result.lastInsertRowid);
}

export function sectionExists(id: number): boolean {
  const row = getDb().prepare("SELECT id FROM menu_sections WHERE id = ?").get(id);
  return Boolean(row);
}

function reorder(
  rows: { id: number; sort_order: number }[],
  id: number,
  direction: "up" | "down",
  apply: (id: number, sort: number) => void,
) {
  const index = rows.findIndex((row) => row.id === id);
  const swapWith = index + (direction === "up" ? -1 : 1);
  if (index < 0 || swapWith < 0 || swapWith >= rows.length) return;
  const next = rows.slice();
  const [row] = next.splice(index, 1);
  next.splice(swapWith, 0, row);
  const db = getDb();
  const tx = db.transaction(() => {
    next.forEach((item, itemIndex) => apply(item.id, (itemIndex + 1) * 10));
  });
  tx();
}

export type { MenuItem };
