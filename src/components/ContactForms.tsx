"use client";

import { useState, type FormEvent } from "react";

function ContactForm({ kind }: { kind: "signup" | "message" }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; ok: boolean } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prefix = `contact-${kind}`;
  const help = (field: string) => errors[field] ? <span className="contact-field-error" id={`${prefix}-${field}-error`}>{errors[field]}</span> : null;
  const described = (field: string) => errors[field] ? `${prefix}-${field}-error` : undefined;

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    setBusy(true); setFeedback(null); setErrors({});
    try {
      const body = new URLSearchParams();
      new FormData(form).forEach((value, key) => { if (typeof value === "string") body.append(key, value); });
      const response = await fetch("/api/contact", { method: "POST", headers: { Accept: "application/json" }, body });
      const result = await response.json();
      setFeedback({ message: result.message || "Please try again or call us.", ok: response.ok });
      setErrors(result.errors || {});
      if (response.ok) form.reset();
    } catch {
      setFeedback({ message: "We couldn’t send that just now. Your details are still here—please try again or call us.", ok: false });
    } finally { setBusy(false); }
  }

  return (
    <form action="/api/contact" method="post" className="contact-form" onSubmit={send} aria-labelledby={`${prefix}-heading`} aria-busy={busy}>
      <input type="hidden" name="kind" value={kind} />
      <div className="contact-honeypot" aria-hidden="true"><label>Leave this blank<input name="company_website" tabIndex={-1} autoComplete="off" /></label></div>
      {kind === "message" ? <label htmlFor={`${prefix}-name`}>Your name<input id={`${prefix}-name`} name="name" autoComplete="name" required maxLength={120} aria-invalid={!!errors.name} aria-describedby={described("name")} />{help("name")}</label> : null}
      <label htmlFor={`${prefix}-email`}>Email address<input id={`${prefix}-email`} name="email" type="email" autoComplete="email" required maxLength={200} aria-invalid={!!errors.email} aria-describedby={described("email")} />{help("email")}</label>
      {kind === "message" ? <>
        <label htmlFor={`${prefix}-topic`}>What’s on your mind?<select id={`${prefix}-topic`} name="topic" defaultValue="General question" aria-invalid={!!errors.topic} aria-describedby={described("topic")}><option>General question</option><option>Special events</option><option>Promotions</option></select>{help("topic")}</label>
        <label htmlFor={`${prefix}-message`}>Your message<textarea id={`${prefix}-message`} name="message" required maxLength={2000} rows={5} aria-invalid={!!errors.message} aria-describedby={described("message")} />{help("message")}</label>
        <p className="hint">We’ll use your details to respond to your message. Sending a message doesn’t sign you up for email updates.</p>
      </> : <>
        <label className="contact-consent" htmlFor={`${prefix}-consent`}><input id={`${prefix}-consent`} name="consent" type="checkbox" value="yes" required aria-invalid={!!errors.consent} aria-describedby={described("consent")} /><span>I’d like email updates about news, events, and promotions from Vinny’s.</span></label>
        {help("consent")}
      </>}
      <div role="status" aria-live="polite" aria-atomic="true">{feedback ? <p className={feedback.ok ? "contact-feedback" : "contact-field-error"}>{feedback.message}</p> : null}</div>
      <button className="btn btn-solid" type="submit" disabled={busy}>{busy ? "Sending…" : kind === "signup" ? "Keep me in the loop" : "Send a message"}</button>
    </form>
  );
}

export function ContactForms() {
  return (
    <div className="contact-forms" id="contact-forms">
      <section className="contact-outreach" aria-labelledby="contact-message-heading">
        <p className="micro-label">There’s a seat for you here</p>
        <h2 id="contact-message-heading">Let’s talk.</h2>
        <p>Have a question, something to celebrate, or an idea to share? Reach out for details about Vinny’s, special events, or promotions. We’d love to hear from you.</p>
        <ContactForm kind="message" />
      </section>
      <section className="contact-signup" aria-labelledby="contact-signup-heading">
        <p className="micro-label">Stay close to Vinny’s</p>
        <h2 id="contact-signup-heading">Good things are worth sharing.</h2>
        <p>Leave your email for news from the kitchen, upcoming events, and promotions.</p>
        <ContactForm kind="signup" />
      </section>
    </div>
  );
}
