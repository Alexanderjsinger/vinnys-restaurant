import { getCsrfToken } from "@/lib/auth";
import { CsrfInput } from "./CsrfInput";

/** Hidden CSRF input for authenticated admin forms (server components). */
export async function CsrfField() {
  const token = await getCsrfToken();
  if (!token) return null;
  return <CsrfInput token={token} />;
}
