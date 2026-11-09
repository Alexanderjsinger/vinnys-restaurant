import { NextResponse } from "next/server";
import { cookieBase, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    ...(await cookieBase()),
    maxAge: 0,
  });
  return response;
}
