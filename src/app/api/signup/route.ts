import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return NextResponse.redirect(new URL("/?join=closed#list", request.url), 303);
}
