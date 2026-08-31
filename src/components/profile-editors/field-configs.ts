// src/components/profile-editors/field-configs.ts
// Shared field section configs for each category, used by both admin and dashboard editors

export interface FieldSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "email" | "tel" | "color" | "select" | "image-upload" | "audio-upload" | "datetime-local" | "array-contacts" | "array-social" | "array-skills" | "array-projects" | "array-experience" | "array-services" | "array-milestones" | "array-events" | "array-gallery" | "array-category-skills";
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  options?: string[];
}

export const CATEGORY_FIELD_SECTIONS: Record<string, FieldSection[]> = {
  "digital-name-card": [
    {
      id: "identity",
      title: "Identity",
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true, maxLength: 30 },
        { key: "jobTitle", label: "Job Title", type: "text", required: true, maxLength: 120 },
        { key: "company", label: "Company", type: "text", maxLength: 30 },
        { key: "companyLogoUrl", label: "Company Logo URL", type: "url" },
        { key: "tagline", label: "Tagline", type: "text", maxLength: 150 },
        { key: "bio", label: "Bio", type: "textarea", maxLength: 1000 },
        { key: "avatarUrl", label: "Profile Photo", type: "image-upload" },
      ],
    },
    {
      id: "contacts",
      title: "Contact Info",
      description: "Email, phone, website, or address entries.",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social",
      title: "Social Links",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "skills",
      title: "Skills",
      fields: [{ key: "skills", label: "Skills", type: "array-skills" }],
    },
    {
      id: "style",
      title: "Style",
      fields: [
        { key: "accentColor", label: "Accent Color", type: "color" },
        { key: "backgroundStyle", label: "Background Style", type: "select", options: ["gradient", "solid", "mesh", "noise"] },
        { key: "featuredQuote", label: "Featured Quote", type: "textarea", maxLength: 300 },
      ],
    },
  ],

  "portfolio": [
    {
      id: "identity",
      title: "About",
      fields: [
        { key: "fullName", label: "Full Name", type: "text", required: true, maxLength: 120 },
        { key: "headline", label: "Headline", type: "text", required: true, maxLength: 200 },
        { key: "bio", label: "Bio", type: "textarea", required: true, maxLength: 2000 },
        { key: "avatarUrl", label: "Profile Photo", type: "image-upload" },
        { key: "resumeUrl", label: "Resume / CV URL", type: "url" },
        { key: "availability", label: "Availability Status", type: "select", options: ["available", "limited", "unavailable"] },
        { key: "availabilityNote", label: "Availability Note", type: "text", maxLength: 200 },
      ],
    },
    {
      id: "contacts",
      title: "Contact Info",
      description: "Email, phone, website, or address entries.",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social",
      title: "Social Links",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "projects",
      title: "Projects",
      description: "Showcase your best work. Mark projects as featured to highlight them.",
      fields: [{ key: "projects", label: "Projects", type: "array-projects" }],
    },
    {
      id: "experience",
      title: "Work Experience",
      description: "Your professional background and roles.",
      fields: [{ key: "experience", label: "Experience", type: "array-experience" }],
    },
    {
      id: "skills",
      title: "Skills",
      description: "Group your skills into categories (e.g. Frontend, Backend, Tools).",
      fields: [{ key: "skills", label: "Skills", type: "array-category-skills" }],
    },
  ],

  "business-ad": [
    {
      id: "identity",
      title: "Business Info",
      fields: [
        { key: "businessName", label: "Business Name", type: "text", required: true, maxLength: 120 },
        { key: "tagline", label: "Tagline", type: "text", required: true, maxLength: 200 },
        { key: "description", label: "Description", type: "textarea", required: true, maxLength: 2000 },
        { key: "logoUrl", label: "Logo URL", type: "url" },
        { key: "heroImageUrl", label: "Hero Image URL", type: "url" },
        { key: "industry", label: "Industry", type: "text", maxLength: 80 },
        { key: "founded", label: "Year Founded", type: "text", placeholder: "2018", maxLength: 4 },
        { key: "primaryCtaLabel", label: "CTA Button Label", type: "text", required: true, maxLength: 60 },
        { key: "primaryCtaUrl", label: "CTA Button URL", type: "url", required: true },
      ],
    },
    {
      id: "contacts",
      title: "Contact",
      fields: [{ key: "contacts", label: "Contacts", type: "array-contacts" }],
    },
    {
      id: "social",
      title: "Social",
      fields: [{ key: "socialLinks", label: "Social Links", type: "array-social" }],
    },
    {
      id: "services",
      title: "Services / Products",
      fields: [{ key: "services", label: "Services", type: "array-services" }],
    },
    {
      id: "gallery",
      title: "Gallery",
      fields: [{ key: "gallery", label: "Gallery Images", type: "array-gallery" }],
    },
  ],

  "wedding-invitation": [
    {
      id: "couple",
      title: "The Couple",
      fields: [
        { key: "partner1.name", label: "Partner 1 Name", type: "text", required: true, maxLength: 80 },
        { key: "partner1.nickname", label: "Partner 1 Nickname", type: "text", maxLength: 40 },
        { key: "partner1.photoUrl", label: "Partner 1 Photo", type: "image-upload" },
        { key: "partner1.bio", label: "Partner 1 Bio", type: "textarea", maxLength: 600 },
        { key: "partner2.name", label: "Partner 2 Name", type: "text", required: true, maxLength: 80 },
        { key: "partner2.nickname", label: "Partner 2 Nickname", type: "text", maxLength: 40 },
        { key: "partner2.photoUrl", label: "Partner 2 Photo", type: "image-upload" },
        { key: "partner2.bio", label: "Partner 2 Bio", type: "textarea", maxLength: 600 },
      ],
    },
    {
      id: "wedding",
      title: "Wedding Details",
      fields: [
        { key: "weddingDate", label: "Wedding Date & Time", type: "datetime-local", required: true },
        { key: "headline", label: "Headline", type: "text", maxLength: 200 },
        { key: "coupleMessage", label: "Message from the Couple", type: "textarea", maxLength: 1000 },
        { key: "hashtag", label: "Wedding Hashtag", type: "text", maxLength: 60 },
        { key: "songTitle", label: "Song Title", type: "text", maxLength: 120 },
        { key: "songArtist", label: "Song Artist", type: "text", maxLength: 120 },
        { key: "spotifyUrl", label: "Background Music", type: "audio-upload" },
      ],
    },
    {
      id: "loveHistory",
      title: "Love Story",
      fields: [{ key: "loveHistory", label: "Milestones", type: "array-milestones" }],
    },
    {
      id: "events",
      title: "Events",
      fields: [{ key: "events", label: "Events", type: "array-events" }],
    },
    {
      id: "gallery",
      title: "Gallery",
      fields: [{ key: "gallery", label: "Photos", type: "array-gallery" }],
    },
    {
      id: "rsvp",
      title: "RSVP",
      description: "Collect attendance, dietary needs, meal choice, plus-one name, and song request.",
      fields: [
        { key: "rsvp._enabled", label: "Enable RSVP", type: "select", options: ["false", "true"] },
        { key: "rsvp.formUrl", label: "RSVP Form URL", type: "url" },
        { key: "rsvp.contactEmail", label: "RSVP Contact Email", type: "email" },
        { key: "rsvp.contactPhone", label: "RSVP Contact Phone", type: "tel" },
        { key: "rsvp.deadline", label: "RSVP Deadline", type: "datetime-local" },
        { key: "rsvp.maxGuestsPerInvite", label: "Max Guests per Invite", type: "text", maxLength: 2 },
        { key: "rsvp.plusOneAllowed", label: "Allow Plus-One", type: "select", options: ["true", "false"] },
        { key: "rsvp.mealOptions", label: "Meal Options", type: "text", maxLength: 200 },
        { key: "rsvp.dietaryNotes", label: "Dietary Notes Prompt", type: "text", maxLength: 200 },
        { key: "rsvp.songRequest", label: "Allow Song Requests", type: "select", options: ["true", "false"] },
        { key: "rsvp.note", label: "RSVP Note", type: "textarea", maxLength: 400 },
      ],
    },
  ],
};

// Helper: get nested value from object
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// Helper: set nested value in object (immutable)
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  const keys = path.split(".");
  const result = { ...obj };
  let current: Record<string, unknown> = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    const next = keys[i + 1]!;
    const isNextIndex = /^\d+$/.test(next);
    if (current[key] && typeof current[key] === "object") {
      current[key] = Array.isArray(current[key])
        ? [...(current[key] as unknown[])]
        : { ...(current[key] as Record<string, unknown>) };
    } else {
      current[key] = isNextIndex ? [] : {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = keys[keys.length - 1]!;
  current[lastKey] = value;
  return result;
}
