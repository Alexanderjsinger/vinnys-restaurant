import { NextResponse } from "next/server";
import { cookieBase, SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, sessionCookieValue } from "@/lib/auth";
import { allowRate } from "@/lib/content";
import { sameOriginPost } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOriginPost(request)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
  const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  if (!(await allowRate(`login:${ip}`, 10, 15 * 60 * 1000))) {
    return NextResponse.redirect(new URL("/admin/login?error=rate", request.url), 303);
  }
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const ok = await checkPassword(password);
  if (!ok) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }
  const token = await sessionCookieValue();
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(SESSION_COOKIE, token, {
    ...(await cookieBase()),
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
