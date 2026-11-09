import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { connection } from "next/server";

export const SESSION_COOKIE = "vinnys_admin";
export const DRAFT_COOKIE = "vinnys_party_draft";
const MAX_AGE = 60 * 60 * 12;
type AuthState = {
  configured: boolean;
  devFallback: boolean;
  password: string | null;
};

async function readPassword(): Promise<string> {
  const fromProcess = process.env["ADMIN_PASSWORD"]?.trim() ?? "";
  if (fromProcess) return fromProcess;
  try {
    const { env } = await import("cloudflare:workers");
    const value = (env as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD?.trim() ?? "";
    return value;
  } catch {
    return "";
  }
}

async function authState(): Promise<AuthState> {
  await connection();
  const password = await readPassword();
  if (password) return { configured: true, devFallback: false, password };
  return { configured: false, devFallback: false, password: null };
}

export async function getAuthStatus(): Promise<Pick<AuthState, "configured" | "devFallback">> {
  const state = await authState();
  return { configured: state.configured, devFallback: state.devFallback };
}

function sign(expiry: string, password: string): string {
  return createHmac("sha256", password).update(expiry).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

export async function checkPassword(input: string): Promise<boolean> {
  if (input.length === 0 || input.length > 500) return false;
  const state = await authState();
  if (!state.password) return false;
  return safeEqual(input, state.password);
}

export function createSessionToken(password: string): string {
  const expiry = String(Date.now() + MAX_AGE * 1000);
  return `${expiry}.${sign(expiry, password)}`;
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const state = await authState();
  if (!token || !state.password) return false;
  const [expiry, mac] = token.split(".");
  if (!expiry || !mac || !/^\d+$/.test(expiry)) return false;
  if (Number(expiry) < Date.now()) return false;
  const expected = sign(expiry, state.password);
  return safeEqual(mac, expected);
}

export async function cookieBase(): Promise<{
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
}> {
  await connection();
  const headerList = await headers();
  const proto = headerList.get("x-forwarded-proto");
  const secure = process.env["COOKIE_SECURE"] === "true" || proto === "https";
  return { httpOnly: true, sameSite: "lax", secure, path: "/" };
}

export async function sessionCookieValue(): Promise<string | null> {
  const state = await authState();
  if (!state.password) return null;
  return createSessionToken(state.password);
}

export const SESSION_MAX_AGE = MAX_AGE;
