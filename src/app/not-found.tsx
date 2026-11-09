import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page wrap">
      <h1>Page not found</h1>
      <p>That page is not on this site.</p>
      <p>
        <Link className="btn" href="/">
          Back home
        </Link>
      </p>
    </div>
  );
}
