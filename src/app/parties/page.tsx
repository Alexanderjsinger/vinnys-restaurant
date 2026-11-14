import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Legacy Private Parties URL — offer removed sitewide; send guests to Contact. */
export default function PartiesPage() {
  permanentRedirect("/contact");
}
