import { env } from "cloudflare:workers";

type BoundStatement = {
  run(): Promise<unknown>;
};

type Statement = {
  bind(...values: unknown[]): BoundStatement;
  run(): Promise<unknown>;
};

type D1Database = {
  prepare(sql: string): Statement;
};

function database(): D1Database {
  return (env as unknown as { DB: D1Database }).DB;
}

export async function insertSignup(email: string, createdAt: string) {
  const db = database();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db.prepare("INSERT INTO signups (email, created_at) VALUES (?, ?)").bind(email, createdAt).run();
}

export async function insertTrack(name: string, createdAt: string) {
  const db = database();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS track_events (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    )
    .run();
  await db
    .prepare("INSERT INTO track_events (name, created_at) VALUES (?, ?)")
    .bind(name, createdAt)
    .run();
}

export async function insertInquiry(input: {
  name: string;
  email: string;
  eventDate: string;
  partySize: number;
  message: string;
  createdAt: string;
}) {
  const db = database();
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
      "INSERT INTO inquiries (name, email, event_date, party_size, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(
      input.name,
      input.email,
      input.eventDate,
      input.partySize,
      input.message,
      input.createdAt,
    )
    .run();
}
