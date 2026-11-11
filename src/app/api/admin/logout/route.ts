import { NextResponse } from "next/server";
import { cookieBase, isAdmin, SESSION_COOKIE, verifyCsrfForm } from "@/lib/auth";
import { sameOriginPost } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const login = new URL("/admin/login", request.url);
  if (!sameOriginPost(request) || !(await isAdmin())) {
    return NextResponse.redirect(login, 303);
  }
  const form = await request.formData();
  if (!(await verifyCsrfForm(form))) {
    return NextResponse.redirect(login, 303);
  }
  const response = NextResponse.redirect(login, 303);
  response.cookies.set(SESSION_COOKIE, "", {
    ...(await cookieBase()),
    maxAge: 0,
  });
  return response;
}
