"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="page wrap">
      <h1>Something went wrong</h1>
      <p>Reload the page. If you just saved content, try that save again.</p>
      <button className="btn" type="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
