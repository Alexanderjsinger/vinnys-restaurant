import { adminError } from "@/lib/messages";

export function SaveBanner({ saved, error }: { saved?: string; error?: string }) {
  const message = adminError(error);
  if (message) {
    return (
      <p className="banner banner-bad" role="alert">
        {message}
      </p>
    );
  }
  if (saved === "draft") {
    return (
      <p className="banner banner-good" role="status">
        Saved as a draft. It is not on the public site.
      </p>
    );
  }
  if (saved === "archived") {
    return (
      <p className="banner banner-good" role="status">
        Removed from the public site.
      </p>
    );
  }
  if (saved === "published" || saved === "1") {
    return (
      <p className="banner banner-good" role="status">
        {saved === "1" ? "Saved." : "Published. The public site shows this now."}
      </p>
    );
  }
  return null;
}
