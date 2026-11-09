import "server-only";
import * as d1 from "./d1-store";
import * as sqlite from "./db";
import snapshotFile from "./public-snapshot.json";
import type { EventRow, Hour, MediaRow, MenuItem, MenuSection, PublishStatus, ReadScope, SettingsMap } from "./types";
import { SETTING_KEYS } from "./types";

type SnapshotFile = {
  settings: Partial<SettingsMap>;
  hours: Array<Partial<Hour> & Pick<Hour, "id" | "label" | "opens" | "closes" | "confirmed" | "sort_order">>;
  menu: MenuSection[];
  events: Array<Partial<EventRow> & Pick<EventRow, "id" | "title" | "starts_at" | "blurb" | "is_sample">>;
};

const snapshot = snapshotFile as SnapshotFile;

async function writeMode(): Promise<"d1" | "sqlite"> {
  if (process.env.VINNYS_FORCE_SQLITE === "1") return "sqlite";
  try {
    const { env } = await import("cloudflare:workers");
    const db = (env as { DB?: { prepare?: unknown } }).DB;
    if (db && typeof db.prepare === "function") return "d1";
  } catch {
    // Local Node has no Workers binding.
  }
  return "sqlite";
}

async function readMode(): Promise<"snapshot" | "d1" | "sqlite"> {
  if (process.env.VINNYS_SNAPSHOT === "1") return "snapshot";
  return writeMode();
}

function blankSettings(): SettingsMap {
  return Object.fromEntries(SETTING_KEYS.map((key) => [key, { value: "", confirmed: false }])) as SettingsMap;
}

function snapshotSettings(): SettingsMap {
  const map = blankSettings();
  for (const key of SETTING_KEYS) {
    const row = snapshot.settings[key];
    if (row) map[key] = { value: row.value ?? "", confirmed: Boolean(row.confirmed) };
  }
  if (!map.notify_email.value) {
    map.notify_email = { value: "alexander.jeffrey.singer@gmail.com", confirmed: false };
  }
  if (!map.hero_heading.value) map.hero_heading = { value: "Vinny's Bar & Grill", confirmed: true };
  return map;
}

function withStatus<T extends { status?: PublishStatus }>(row: T): T & { status: PublishStatus } {
  return { ...row, status: row.status ?? "published" };
}

export async function getSettings(): Promise<SettingsMap> {
  const mode = await readMode();
  if (mode === "snapshot") return snapshotSettings();
  if (mode === "d1") return d1.getSettings();
  return sqlite.getSettings();
}

export async function saveSetting(key: Parameters<typeof sqlite.saveSetting>[0], value: string, confirmed: boolean) {
  if ((await writeMode()) === "d1") return d1.saveSetting(key, value, confirmed);
  sqlite.saveSetting(key, value, confirmed);
}

export async function listHours(): Promise<Hour[]> {
  const mode = await readMode();
  if (mode === "snapshot") {
    return snapshot.hours.map((hour) => ({
      id: hour.id,
      label: hour.label,
      opens: hour.opens,
      closes: hour.closes,
      confirmed: hour.confirmed,
      sort_order: hour.sort_order,
      kind: hour.kind ?? "weekly",
      starts_on: hour.starts_on ?? "",
      ends_on: hour.ends_on ?? "",
      status: hour.status ?? "published",
      updated_at: hour.updated_at ?? "",
      published_at: hour.published_at ?? "",
    }));
  }
  if (mode === "d1") return d1.listHours();
  return sqlite.listHours();
}

export async function updateHour(row: Parameters<typeof sqlite.updateHour>[0]) {
  if ((await writeMode()) === "d1") return d1.updateHour(row);
  sqlite.updateHour(row);
}

export async function addHour(label: string, opens: string, closes: string) {
  if ((await writeMode()) === "d1") return d1.addHour(label, opens, closes);
  sqlite.addHour(label, opens, closes);
}

export async function addHolidayHour(input: Parameters<typeof sqlite.addHolidayHour>[0]) {
  if ((await writeMode()) === "d1") return d1.addHolidayHour(input);
  sqlite.addHolidayHour(input);
}

export async function deleteHour(id: number) {
  if ((await writeMode()) === "d1") return d1.deleteHour(id);
  sqlite.deleteHour(id);
}

export async function moveHour(id: number, direction: "up" | "down") {
  if ((await writeMode()) === "d1") return d1.moveHour(id, direction);
  sqlite.moveHour(id, direction);
}

function filterMenu(menu: MenuSection[], scope: ReadScope): MenuSection[] {
  return menu
    .map((section) => ({
      ...withStatus(section),
      items: section.items
        .map((item) => ({
          ...item,
          available: item.available !== false,
          dietary: item.dietary ?? "",
          status: item.status ?? "published",
          updated_at: item.updated_at ?? "",
          published_at: item.published_at ?? "",
        }))
        .filter((item) => keep(item, scope) && (scope !== "public" || item.available)),
    }))
    .filter((section) => keep(section, scope) && (scope === "admin" || section.items.length > 0));
}

function keep(row: { status?: PublishStatus; is_sample?: boolean }, scope: ReadScope): boolean {
  const status = row.status ?? "published";
  if (scope === "admin") return true;
  if (row.is_sample && scope === "public") return false;
  if (status === "archived") return false;
  if (scope === "preview") return status === "draft" || status === "published";
  return status === "published";
}

export async function listMenu(scope: ReadScope = "public"): Promise<MenuSection[]> {
  const mode = await readMode();
  const menu = mode === "snapshot" ? snapshot.menu : mode === "d1" ? await d1.listMenu() : sqlite.listMenu();
  return filterMenu(menu, scope);
}

export async function addSection(name: string, blurb: string) {
  if ((await writeMode()) === "d1") return d1.addSection(name, blurb);
  sqlite.addSection(name, blurb);
}

export async function updateSection(id: number, name: string, blurb: string) {
  if ((await writeMode()) === "d1") return d1.updateSection(id, name, blurb);
  sqlite.updateSection(id, name, blurb);
}

export async function deleteSection(id: number) {
  if ((await writeMode()) === "d1") return d1.deleteSection(id);
  sqlite.deleteSection(id);
}

export async function moveSection(id: number, direction: "up" | "down") {
  if ((await writeMode()) === "d1") return d1.moveSection(id, direction);
  sqlite.moveSection(id, direction);
}

export async function sectionExists(id: number): Promise<boolean> {
  if ((await writeMode()) === "d1") return d1.sectionExists(id);
  return sqlite.sectionExists(id);
}

export async function addItem(input: Parameters<typeof sqlite.addItem>[0]) {
  if ((await writeMode()) === "d1") return d1.addItem(input);
  sqlite.addItem(input);
}

export async function updateItem(input: Parameters<typeof sqlite.updateItem>[0]) {
  if ((await writeMode()) === "d1") return d1.updateItem(input);
  sqlite.updateItem(input);
}

export async function deleteItem(id: number) {
  if ((await writeMode()) === "d1") return d1.deleteItem(id);
  sqlite.deleteItem(id);
}

export async function moveItem(id: number, direction: "up" | "down") {
  if ((await writeMode()) === "d1") return d1.moveItem(id, direction);
  sqlite.moveItem(id, direction);
}

export async function listEvents(scope: ReadScope = "public"): Promise<EventRow[]> {
  const mode = await readMode();
  const rows =
    mode === "snapshot"
      ? snapshot.events.map((event) => ({
          id: event.id,
          title: event.title,
          starts_at: event.starts_at,
          ends_at: event.ends_at ?? "",
          blurb: event.blurb,
          is_sample: event.is_sample,
          price: event.price ?? "",
          photo: event.photo ?? "",
          next_step: event.next_step ?? "",
          status: event.status ?? "published",
          updated_at: event.updated_at ?? "",
          published_at: event.published_at ?? "",
        }))
      : mode === "d1"
        ? await d1.listEvents()
        : sqlite.listEvents();
  return rows.filter((event) => keep(event, scope));
}

export async function addEvent(input: Parameters<typeof sqlite.addEvent>[0]) {
  if ((await writeMode()) === "d1") return d1.addEvent(input);
  sqlite.addEvent(input);
}

export async function updateEvent(input: Parameters<typeof sqlite.updateEvent>[0]) {
  if ((await writeMode()) === "d1") return d1.updateEvent(input);
  sqlite.updateEvent(input);
}

export async function deleteEvent(id: number) {
  if ((await writeMode()) === "d1") return d1.deleteEvent(id);
  sqlite.deleteEvent(id);
}

export async function listInquiries() {
  if ((await writeMode()) === "d1") return d1.listInquiries();
  return sqlite.listInquiries();
}

export async function addInquiry(input: Parameters<typeof sqlite.addInquiry>[0]): Promise<number> {
  if ((await writeMode()) === "d1") return d1.addInquiry(input);
  return sqlite.addInquiry(input);
}

export async function deleteInquiry(id: number) {
  if ((await writeMode()) === "d1") return d1.deleteInquiry(id);
  sqlite.deleteInquiry(id);
}

export async function listSignups() {
  if ((await writeMode()) === "d1") return d1.listSignups();
  return sqlite.listSignups();
}

export async function allowRate(bucket: string, limit: number, windowMs: number): Promise<boolean> {
  if ((await writeMode()) === "d1") return d1.allowRate(bucket, limit, windowMs);
  return sqlite.allowRate(bucket, limit, windowMs);
}

export async function enqueueNotify(inquiryId: number, reason: string) {
  if ((await writeMode()) === "d1") return d1.enqueueNotify(inquiryId, reason);
  sqlite.enqueueNotify(inquiryId, reason);
}

export async function listMedia(): Promise<MediaRow[]> {
  if ((await writeMode()) === "d1") return d1.listMedia();
  return sqlite.listMedia();
}

export async function addMedia(input: Omit<MediaRow, "id">): Promise<number> {
  if ((await writeMode()) === "d1") return d1.addMedia(input);
  return sqlite.addMedia(input);
}

export async function getMedia(id: number): Promise<MediaRow | null> {
  if ((await writeMode()) === "d1") return d1.getMedia(id);
  return sqlite.listMedia().find((row) => row.id === id) ?? null;
}

export async function runtimeLabel(): Promise<string> {
  const read = await readMode();
  const write = await writeMode();
  return `read:${read} write:${write}`;
}

export type { MenuItem };
