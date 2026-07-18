// src/lib/settings.ts — Read/write platform settings from JSON file
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const SETTINGS_PATH = join(process.cwd(), "data", "settings.json");

export type Settings = {
  site_name: string;
  site_url: string;
  support_email: string;
  maintenance_mode: boolean;
  allow_registration: boolean;
  require_email_verify: boolean;
  max_profiles_per_user: number;
  enable_og_images: boolean;
  enable_analytics: boolean;
  enable_r2_uploads: boolean;
  isr_revalidate_sec: number;
  notify_new_user: boolean;
  notify_email: string;
};

const DEFAULTS: Settings = {
  site_name: "NEX CARD",
  site_url: "https://nexcard.io",
  support_email: "support@nexcard.io",
  maintenance_mode: false,
  allow_registration: true,
  require_email_verify: false,
  max_profiles_per_user: 4,
  enable_og_images: true,
  enable_analytics: true,
  enable_r2_uploads: true,
  isr_revalidate_sec: 3600,
  notify_new_user: true,
  notify_email: "admin@nexcard.io",
};

export async function getSettings(): Promise<Settings> {
  try {
    if (!existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
    const raw = await readFile(SETTINGS_PATH, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}
