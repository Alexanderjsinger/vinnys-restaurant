/** Owner-supplied destinations: Facebook is a community post, Instagram a profile. */
export function SocialLinks() {
  return (
    <div className="social-links" role="group" aria-label="Find Vinny’s on social media">
      <a href="https://www.facebook.com/groups/408300729339139/posts/3587888904713623/" target="_blank" rel="noopener noreferrer" aria-label="Facebook community post about Vinny’s (opens in a new tab)">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.6V3.9a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4V10H8.4v3H11v8h3Z" /></svg>
      </a>
      <a href="https://www.instagram.com/vinnysbarandgrill.ypsi/" target="_blank" rel="noopener noreferrer" aria-label="Vinny’s on Instagram (opens in a new tab)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.8" r=".8" fill="currentColor" stroke="none" /></svg>
      </a>
    </div>
  );
}
