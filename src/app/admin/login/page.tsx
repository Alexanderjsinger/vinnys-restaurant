import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthStatus, isAdmin } from "@/lib/auth";
import { firstQuery } from "@/lib/messages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Admin sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAdmin()) redirect("/admin");
  const query = await searchParams;
  const error = firstQuery(query.error);
  const status = await getAuthStatus();
  return (
    <div className="page wrap">
      <h1>Admin</h1>
      <p>Sign in to edit the menu, events, hours, and ordering link.</p>
      {error === "1" ? (
        <p className="banner banner-bad" role="alert">
          That password did not match.
        </p>
      ) : null}
      {error === "rate" ? (
        <p className="banner banner-bad" role="alert">
          Too many sign-in attempts. Wait a few minutes and try again.
        </p>
      ) : null}
      {error === "config" || !status.configured ? (
        <p className="banner banner-bad" role="alert">
          Set ADMIN_PASSWORD on the server before signing in.
        </p>
      ) : null}
      <form className="form-grid" action="/api/admin/login" method="post">
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="btn btn-solid" type="submit">
          Sign in
        </button>
      </form>
    </div>
  );
}
