/** Pure submission workflow; persistence and notifications are supplied by the server. */
export type ContactResult = { status: number; message: string; errors?: Record<string, string> };
type Message = { name: string; email: string; eventDate: string; partySize: number; message: string };
type Services = {
  allow: () => Promise<boolean>;
  signup: (email: string) => Promise<void>;
  message: (input: Message) => Promise<number>;
  notify: (input: Message & { id: number }) => Promise<void>;
};
export async function submitContact(form: FormData, services: Services): Promise<ContactResult> {
  const text = (name: string) => typeof form.get(name) === "string" ? String(form.get(name)).trim() : "";
  const kind = text("kind");
  if (kind !== "signup" && kind !== "message") return { status: 400, message: "Please choose a form and try again." };
  const success = kind === "signup" ? "You’re on the list. Thanks for keeping in touch with Vinny’s!" : "Thanks for reaching out. Your message has been received. For anything time-sensitive, please call us.";
  if (text("company_website")) return { status: 200, message: success };
  if (!(await services.allow())) return { status: 429, message: "You’ve sent a few requests recently. Please try again in 15 minutes, or give us a call." };
  const email = text("email").toLowerCase();
  const errors: Record<string, string> = {};
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (kind === "signup") {
    if (text("consent") !== "yes") errors.consent = "Please confirm you’d like email updates.";
    if (Object.keys(errors).length) return { status: 422, message: "Please check the highlighted fields.", errors };
    await services.signup(email);
  } else {
    const name = text("name"), message = text("message"), topic = text("topic");
    if (!name || name.length > 120) errors.name = "Enter your name (up to 120 characters).";
    if (!message || message.length > 2000) errors.message = "Add a message (up to 2,000 characters).";
    if (!["General question", "Special events", "Promotions"].includes(topic)) errors.topic = "Choose what you’d like to talk about.";
    if (Object.keys(errors).length) return { status: 422, message: "Please check the highlighted fields.", errors };
    const input = { name, email, eventDate: "", partySize: 0, message: `${topic}\n\n${message}` };
    const id = await services.message(input);
    try { await services.notify({ ...input, id }); } catch { /* Stored messages remain available in admin if notification fails. */ }
  }
  return { status: 200, message: success };
}
