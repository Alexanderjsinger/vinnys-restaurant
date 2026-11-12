import "server-only";
import {
  addEvent,
  addHolidayHour,
  addHour,
  addInquiry,
  addItem,
  addSection,
  allowRate,
  deleteEvent,
  deleteHour,
  deleteInquiry,
  deleteItem,
  deleteSection,
  listHours,
  moveHour,
  moveItem,
  moveSection,
  saveSetting,
  sectionExists,
  updateEvent,
  updateHour,
  updateItem,
  updateSection,
} from "./content";
import {
  asId,
  cleanEventPhoto,
  cleanText,
  detroitToday,
  isEmail,
  isValidDate,
  normalizeDateTime,
  normalizePrice,
  normalizeTime,
  parseProvider,
  safeHttpUrl,
} from "./format";
import { notifyOwner } from "./notify";
import { recordTrack } from "./track";
import type { PartyDraft, PublishStatus } from "./types";

function checked(form: FormData, name: string): boolean {
  return form.get(name) === "on" || form.get(name) === "1";
}

function direction(form: FormData): "up" | "down" | null {
  const value = String(form.get("dir") ?? "");
  if (value === "up" || value === "down") return value;
  return null;
}

function recordStatus(form: FormData): PublishStatus {
  const action = String(form.get("action") ?? "");
  if (action === "publish") return "published";
  if (action === "draft") return "draft";
  if (action === "archive") return "archived";
  const posted = String(form.get("status") ?? "");
  if (posted === "draft" || posted === "published" || posted === "archived") return posted;
  return "published";
}

function saved(path: string, status: PublishStatus): string {
  return `${path}?saved=${status}`;
}

export async function applyAdminSave(form: FormData): Promise<string> {
  const intent = String(form.get("intent") ?? "");
  switch (intent) {
    case "place":
      return savePlace(form);
    case "homepage":
      return saveHomepage(form);
    case "ordering":
      return saveOrdering(form);
    case "hour-add":
      return saveHourAdd(form);
    case "holiday-add":
      return saveHolidayAdd(form);
    case "hour-delete":
      return saveHourDelete(form);
    case "hour-move":
      return saveHourMove(form);
    case "section-add":
      return saveSectionAdd(form);
    case "section-update":
      return saveSectionUpdate(form);
    case "section-delete":
      return saveSectionDelete(form);
    case "section-move":
      return saveSectionMove(form);
    case "item-add":
      return saveItemAdd(form);
    case "item-update":
      return saveItemUpdate(form);
    case "item-delete":
      return saveItemDelete(form);
    case "item-move":
      return saveItemMove(form);
    case "event-add":
      return saveEventAdd(form);
    case "event-update":
      return saveEventUpdate(form);
    case "event-delete":
      return saveEventDelete(form);
    case "inquiry-delete":
      return saveInquiryDelete(form);
    case "notify-retry":
      return saveNotifyRetry();
    default:
      return "/admin?error=unknown";
  }
}

async function saveNotifyRetry(): Promise<string> {
  const { retryPendingNotifications } = await import("./notify");
  const result = await retryPendingNotifications(10);
  if (result.attempted === 0) return "/admin/inquiries?error=notify-skip";
  if (result.sent > 0 && result.failed === 0) return "/admin/inquiries?saved=published";
  if (result.sent > 0) return "/admin/inquiries?saved=draft";
  return "/admin/inquiries?error=notify-fail";
}

async function savePlace(form: FormData): Promise<string> {
  const name = cleanText(form.get("restaurant_name"), 120);
  const address = cleanText(form.get("address"), 200);
  const phone = cleanText(form.get("phone"), 40);
  const email = cleanText(form.get("email"), 200);
  const notify = cleanText(form.get("notify_email"), 200);
  if (!name || !address) return "/admin/place?error=required";
  if (email && !isEmail(email)) return "/admin/place?error=email";
  if (notify && !isEmail(notify)) return "/admin/place?error=email";

  const ids = form.getAll("hour_id").map((value) => asId(value));
  if (ids.some((id) => id === null)) return "/admin/place?error=time";
  const hourIds = ids as number[];
  const known = new Set((await listHours()).map((hour) => hour.id));
  const hours = hourIds.map((id) => {
    const label = cleanText(form.get(`hour_label_${id}`), 80);
    const opens = normalizeTime(String(form.get(`hour_opens_${id}`) ?? ""));
    const closes = normalizeTime(String(form.get(`hour_closes_${id}`) ?? ""));
    const confirmed = checked(form, `hour_confirmed_${id}`);
    return { id, label, opens, closes, confirmed };
  });
  if (hours.some((hour) => !known.has(hour.id) || !hour.label || !hour.opens || !hour.closes)) {
    return "/admin/place?error=time";
  }

  await saveSetting("restaurant_name", name, checked(form, "restaurant_name_confirmed"));
  await saveSetting("address", address, checked(form, "address_confirmed"));
  await saveSetting("phone", phone, phone.length > 0 && checked(form, "phone_confirmed"));
  await saveSetting("email", email, email.length > 0 && checked(form, "email_confirmed"));
  if (notify) await saveSetting("notify_email", notify, false);
  for (const hour of hours) {
    await updateHour({
      id: hour.id,
      label: hour.label,
      opens: hour.opens as string,
      closes: hour.closes as string,
      confirmed: hour.confirmed,
    });
  }
  return "/admin/place?saved=published";
}

async function saveHomepage(form: FormData): Promise<string> {
  const heading = cleanText(form.get("hero_heading"), 120);
  const text = cleanText(form.get("hero_text"), 400);
  const image = cleanText(form.get("hero_image"), 300);
  const tagline = cleanText(form.get("tagline"), 160);
  if (!heading || !text) return "/admin/homepage?error=required";
  if (image && !image.startsWith("/") && !safeHttpUrl(image)) return "/admin/homepage?error=url";
  await saveSetting("hero_heading", heading, true);
  await saveSetting("hero_text", text, true);
  await saveSetting("hero_image", image, Boolean(image));
  await saveSetting("tagline", tagline, tagline.length > 0 && checked(form, "tagline_confirmed"));
  return "/admin/homepage?saved=published";
}

async function saveHourAdd(form: FormData): Promise<string> {
  const label = cleanText(form.get("label"), 80);
  const opens = normalizeTime(String(form.get("opens") ?? ""));
  const closes = normalizeTime(String(form.get("closes") ?? ""));
  if (!label || !opens || !closes) return "/admin/place?error=time";
  await addHour(label, opens, closes);
  return "/admin/place?saved=published";
}

async function saveHolidayAdd(form: FormData): Promise<string> {
  const label = cleanText(form.get("label"), 80);
  const startsOn = cleanText(form.get("starts_on"), 20);
  const endsOn = cleanText(form.get("ends_on"), 20) || startsOn;
  const opens = normalizeTime(String(form.get("opens") ?? ""));
  const closes = normalizeTime(String(form.get("closes") ?? ""));
  if (!label || !opens || !closes || !isValidDate(startsOn) || !isValidDate(endsOn) || endsOn < startsOn) {
    return "/admin/place?error=date";
  }
  await addHolidayHour({ label, opens, closes, startsOn, endsOn });
  return "/admin/place?saved=published";
}

async function saveHourDelete(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  if (!id || !checked(form, "yes")) return "/admin/place?error=confirm";
  await deleteHour(id);
  return "/admin/place?saved=published";
}

async function saveHourMove(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const dir = direction(form);
  if (!id || !dir) return "/admin/place?error=unknown";
  await moveHour(id, dir);
  return "/admin/place?saved=published";
}

async function saveOrdering(form: FormData): Promise<string> {
  const raw = cleanText(form.get("toast_ordering_url"), 500);
  if (raw && !safeHttpUrl(raw)) return "/admin/ordering?error=url";
  await saveSetting("toast_ordering_url", raw ? (safeHttpUrl(raw) as string) : "", false);
  return "/admin/ordering?saved=published";
}

async function saveSectionAdd(form: FormData): Promise<string> {
  const name = cleanText(form.get("name"), 80);
  const blurb = cleanText(form.get("blurb"), 240);
  if (!name) return "/admin/menu?error=required";
  await addSection(name, blurb);
  return "/admin/menu?saved=published";
}

async function saveSectionUpdate(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const name = cleanText(form.get("name"), 80);
  const blurb = cleanText(form.get("blurb"), 240);
  if (!id || !name) return "/admin/menu?error=required";
  await updateSection(id, name, blurb);
  return "/admin/menu?saved=published";
}

async function saveSectionDelete(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  if (!id || !checked(form, "yes")) return "/admin/menu?error=confirm";
  await deleteSection(id);
  return "/admin/menu?saved=published";
}

async function saveSectionMove(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const dir = direction(form);
  if (!id || !dir) return "/admin/menu?error=unknown";
  await moveSection(id, dir);
  return "/admin/menu?saved=published";
}

function itemFields(form: FormData) {
  return {
    name: cleanText(form.get("name"), 120),
    description: cleanText(form.get("description"), 400),
    price: normalizePrice(cleanText(form.get("price"), 40), true),
    isSample: checked(form, "is_sample"),
    glutenFree: checked(form, "gluten_free"),
    available: form.getAll("available").some((value) => value === "1" || value === "on"),
    dietary: cleanText(form.get("dietary"), 120),
    status: recordStatus(form),
  };
}

async function saveItemAdd(form: FormData): Promise<string> {
  const sectionId = asId(form.get("section_id"));
  const item = itemFields(form);
  if (!sectionId || !(await sectionExists(sectionId)) || !item.name || !item.price) {
    return item.price === null ? "/admin/menu?error=price" : "/admin/menu?error=required";
  }
  await addItem({ sectionId, ...item, price: item.price });
  return saved("/admin/menu", item.status);
}

async function saveItemUpdate(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const sectionId = asId(form.get("section_id"));
  const item = itemFields(form);
  if (!id || !sectionId || !(await sectionExists(sectionId)) || !item.name || !item.price) {
    return item.price === null ? "/admin/menu?error=price" : "/admin/menu?error=required";
  }
  await updateItem({ id, sectionId, ...item, price: item.price });
  return saved("/admin/menu", item.status);
}

async function saveItemDelete(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  if (!id || !checked(form, "yes")) return "/admin/menu?error=confirm";
  await deleteItem(id);
  return "/admin/menu?saved=removed";
}

async function saveItemMove(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const dir = direction(form);
  if (!id || !dir) return "/admin/menu?error=unknown";
  await moveItem(id, dir);
  return "/admin/menu?saved=published";
}

function eventTimes(form: FormData): { startsAt: string; endsAt: string } | null {
  const date = cleanText(form.get("event_date"), 20);
  const start = normalizeTime(String(form.get("start_time") ?? ""));
  const endRaw = String(form.get("end_time") ?? "").trim();
  const end = endRaw ? normalizeTime(endRaw) : "";
  if (date || start || endRaw) {
    if (!isValidDate(date) || !start || (endRaw && !end)) return null;
    const startsAt = `${date}T${start}`;
    const endsAt = end ? `${date}T${end}` : "";
    if (endsAt && endsAt <= startsAt) return null;
    return { startsAt, endsAt };
  }
  const legacy = normalizeDateTime(String(form.get("starts_at") ?? ""));
  if (!legacy) return null;
  return { startsAt: legacy, endsAt: "" };
}

async function saveEventAdd(form: FormData): Promise<string> {
  const title = cleanText(form.get("title"), 120);
  const blurb = cleanText(form.get("blurb"), 800);
  const times = eventTimes(form);
  const price = normalizePrice(cleanText(form.get("price"), 40), false);
  const photo = cleanEventPhoto(cleanText(form.get("photo"), 300));
  const status = recordStatus(form);
  if (!title || !blurb || !times) return "/admin/events?error=required";
  if (price === null) return "/admin/events?error=price";
  if (photo === null) return "/admin/events?error=photo";
  await addEvent({
    title,
    startsAt: times.startsAt,
    endsAt: times.endsAt,
    blurb,
    isSample: false,
    price,
    photo,
    nextStep: "",
    status,
  });
  return saved("/admin/events", status);
}

async function saveEventUpdate(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  const title = cleanText(form.get("title"), 120);
  const blurb = cleanText(form.get("blurb"), 800);
  const times = eventTimes(form);
  const price = normalizePrice(cleanText(form.get("price"), 40), false);
  const photo = cleanEventPhoto(cleanText(form.get("photo"), 300));
  const status = recordStatus(form);
  if (!id || !title || !blurb || !times) return "/admin/events?error=required";
  if (price === null) return "/admin/events?error=price";
  if (photo === null) return "/admin/events?error=photo";
  await updateEvent({
    id,
    title,
    startsAt: times.startsAt,
    endsAt: times.endsAt,
    blurb,
    isSample: false,
    price,
    photo,
    nextStep: "",
    status,
  });
  return saved("/admin/events", status);
}

async function saveEventDelete(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  if (!id || !checked(form, "yes")) return "/admin/events?error=confirm";
  await deleteEvent(id);
  return "/admin/events?saved=deleted";
}

async function saveInquiryDelete(form: FormData): Promise<string> {
  const id = asId(form.get("id"));
  if (!id || !checked(form, "yes")) return "/admin/inquiries?error=confirm";
  await deleteInquiry(id);
  return "/admin/inquiries?saved=removed";
}

type InquiryResult =
  | { ok: true; stored: boolean }
  | { ok: false; errors: string[]; draft: PartyDraft };

export async function submitInquiry(form: FormData, bucket: string): Promise<InquiryResult> {
  const draft: PartyDraft = {
    name: cleanText(form.get("name"), 120),
    email: cleanText(form.get("email"), 200),
    event_date: cleanText(form.get("event_date"), 20),
    party_size: cleanText(form.get("party_size"), 10),
    message: cleanText(form.get("event_type") ?? form.get("message"), 200),
  };
  if (cleanText(form.get("company_website"), 200)) {
    return { ok: true, stored: false };
  }
  if (!(await allowRate(bucket, 8, 15 * 60 * 1000))) {
    return { ok: false, errors: ["rate"], draft };
  }

  const errors: string[] = [];
  if (!draft.name) errors.push("name");
  if (!isEmail(draft.email)) errors.push("email");
  if (!isValidDate(draft.event_date) || draft.event_date < detroitToday()) errors.push("date");
  const size = Number(draft.party_size);
  if (!/^\d+$/.test(draft.party_size) || !Number.isInteger(size) || size < 1 || size > 500) {
    errors.push("size");
  }
  if (!draft.message) errors.push("event");
  if (errors.length) return { ok: false, errors, draft };

  const id = await addInquiry({
    name: draft.name,
    email: draft.email,
    eventDate: draft.event_date,
    partySize: Number(draft.party_size),
    message: draft.message,
  });
  try {
    await notifyOwner({
      id,
      name: draft.name,
      email: draft.email,
      eventDate: draft.event_date,
      partySize: Number(draft.party_size),
      message: draft.message,
    });
  } catch (error) {
    console.error(error);
  }
  try {
    await recordTrack("party_inquiry_submit");
  } catch {
    // The inquiry is already stored.
  }
  return { ok: true, stored: true };
}
