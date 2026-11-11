import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { getCsrfToken, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const csrfToken = await getCsrfToken();
  if (!csrfToken) redirect("/admin/login");
  return (
    <div className="page wrap">
      <AdminNav csrfToken={csrfToken} />
      {children}
    </div>
  );
}
