import { NextResponse } from "next/server";
import { cookieBase, DRAFT_COOKIE } from "@/lib/auth";
import { sameOriginPost } from "@/lib/format";
import { submitInquiry } from "@/lib/mutate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOriginPost(request)) {
    return NextResponse.redirect(new URL("/parties?error=save", request.url), 303);
  }
  const form = await request.formData();
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown";
  let result: Awaited<ReturnType<typeof submitInquiry>>;
  try {
    result = await submitInquiry(form, `inquiry:${ip.split(",")[0].trim()}`);
  } catch {
    return NextResponse.redirect(new URL("/parties?error=save", request.url), 303);
  }
  const base = await cookieBase();
  if (!result.ok) {
    const response = NextResponse.redirect(
      new URL(`/parties?error=${encodeURIComponent(result.errors.join(","))}`, request.url),
      303,
    );
    response.cookies.set(DRAFT_COOKIE, JSON.stringify(result.draft), { ...base, maxAge: 600 });
    return response;
  }
  if (!result.stored) {
    const response = NextResponse.redirect(new URL("/parties?sent=1", request.url), 303);
    response.cookies.set(DRAFT_COOKIE, "", { ...base, maxAge: 0 });
    return response;
  }
  const response = NextResponse.redirect(new URL("/parties?sent=1", request.url), 303);
  response.cookies.set(DRAFT_COOKIE, "", { ...base, maxAge: 0 });
  return response;
}
