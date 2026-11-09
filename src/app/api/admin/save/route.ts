import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { sameOriginPost } from "@/lib/format";
import { applyAdminSave } from "@/lib/mutate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOriginPost(request) || !(await isAdmin())) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }
  const form = await request.formData();
  let path = "/admin?error=save";
  try {
    path = await applyAdminSave(form);
  } catch (error) {
    console.error(error);
    path = "/admin?error=save";
  }
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    console.error(error);
  }
  return NextResponse.redirect(new URL(path, request.url), 303);
}
