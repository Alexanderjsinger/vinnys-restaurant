export const SETTING_KEYS = [
  "restaurant_name",
  "tagline",
  "address",
  "phone",
  "email",
  "notify_email",
  "owner_name",
  "opened_on",
  "former_venue",
  "cuisine_summary",
  "promo_headline",
  "promo_body",
  "promo_link_label",
  "promo_link_url",
  "toast_ordering_url",
  "reservation_provider",
  "reservation_url",
  "hero_heading",
  "hero_text",
  "hero_image",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type Setting = {
  value: string;
  confirmed: boolean;
};

export type SettingsMap = Record<SettingKey, Setting>;

export type ProviderId = "none" | "toast" | "opentable" | "resy";

export type PublishStatus = "draft" | "published" | "archived";

export type ReadScope = "public" | "preview" | "admin";

export type Hour = {
  id: number;
  label: string;
  opens: string;
  closes: string;
  confirmed: boolean;
  sort_order: number;
  kind: "weekly" | "holiday";
  starts_on: string;
  ends_on: string;
  status: PublishStatus;
  updated_at: string;
  published_at: string;
};

export type MenuItem = {
  id: number;
  section_id: number;
  name: string;
  description: string;
  price: string;
  sort_order: number;
  is_sample: boolean;
  gluten_free: boolean;
  marked: boolean;
  available: boolean;
  dietary: string;
  status: PublishStatus;
  updated_at: string;
  published_at: string;
};

export type MenuSection = {
  id: number;
  name: string;
  blurb: string;
  sort_order: number;
  status: PublishStatus;
  updated_at: string;
  published_at: string;
  items: MenuItem[];
};

export type EventRow = {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  blurb: string;
  is_sample: boolean;
  price: string;
  photo: string;
  next_step: string;
  status: PublishStatus;
  updated_at: string;
  published_at: string;
};

export type MediaRow = {
  id: number;
  object_key: string;
  alt: string;
  content_type: string;
  bytes: number;
  created_at: string;
};

export type NotifyStatus = "pending" | "sent" | "failed";

export type NotifyQueueRow = {
  id: number;
  inquiry_id: number;
  reason: string;
  status: NotifyStatus;
  attempts: number;
  last_attempt_at: string;
  sent_at: string;
  created_at: string;
};

export type NotifyQueueJoin = NotifyQueueRow & {
  name: string;
  email: string;
  event_date: string;
  party_size: number;
  message: string;
};

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  event_date: string;
  party_size: number;
  message: string;
  created_at: string;
};

export type StoryFact = {
  label: string;
  value: string;
};

export type PublicSite = {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  phoneHref: string | null;
  email: string;
  mapUrl: string | null;
  hours: Hour[];
  promo: {
    headline: string;
    body: string;
    linkLabel: string;
    linkUrl: string | null;
  };
  toastUrl: string | null;
  heroHeading: string;
  heroText: string;
  heroImage: string;
  reservation: {
    provider: ProviderId;
    url: string | null;
    ready: boolean;
  };
  story: StoryFact[];
};

export type PartyDraft = {
  name: string;
  email: string;
  event_date: string;
  party_size: string;
  message: string;
};
