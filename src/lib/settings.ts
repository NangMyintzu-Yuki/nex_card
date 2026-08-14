// src/lib/settings.ts — Platform settings (DB-backed with JSON file fallback)

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";

const SETTINGS_PATH = join(process.cwd(), "data", "settings.json");
const SETTINGS_KEY = "platform";

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
  wallet_account_name: string;
  wallet_kbzpay: string;
  wallet_wavepay: string;
  wallet_ayapay: string;
};

export const SettingsSchema = z.object({
  site_name: z.string().min(1).max(80),
  site_url: z.string().url(),
  support_email: z.string().email(),
  maintenance_mode: z.boolean(),
  allow_registration: z.boolean(),
  require_email_verify: z.boolean(),
  max_profiles_per_user: z.number().int().min(1).max(20),
  enable_og_images: z.boolean(),
  enable_analytics: z.boolean(),
  enable_r2_uploads: z.boolean(),
  isr_revalidate_sec: z.number().int().min(60).max(86400),
  notify_new_user: z.boolean(),
  notify_email: z.string().email(),
  wallet_account_name: z.string().min(1).max(80),
  wallet_kbzpay: z.string().min(1).max(40),
  wallet_wavepay: z.string().min(1).max(40),
  wallet_ayapay: z.string().min(1).max(40),
});

const DEFAULTS: Settings = {
  site_name: "NEX CARD",
  site_url: "https://nexcard.io",
  support_email: "support@nexcard.io",
  maintenance_mode: false,
  allow_registration: true,
  require_email_verify: true,
  max_profiles_per_user: 4,
  enable_og_images: true,
  enable_analytics: true,
  enable_r2_uploads: true,
  isr_revalidate_sec: 3600,
  notify_new_user: true,
  notify_email: "admin@nexcard.io",
  wallet_account_name: "NEX CARD",
  wallet_kbzpay: "09-000000000",
  wallet_wavepay: "09-000000000",
  wallet_ayapay: "09-000000000",
};

async function readFileSettings(): Promise<Settings> {
  try {
    if (!existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
    const raw = await readFile(SETTINGS_PATH, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

async function writeFileSettings(settings: Settings): Promise<void> {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");
}

async function readDbSettings(): Promise<Settings | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const prisma = (await import("@/lib/db/prisma")).default;
    const row = await prisma.systemSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });
    if (!row?.value || typeof row.value !== "object") return null;
    return { ...DEFAULTS, ...(row.value as Partial<Settings>) };
  } catch {
    return null;
  }
}

async function writeDbSettings(settings: Settings): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const prisma = (await import("@/lib/db/prisma")).default;
    await prisma.systemSetting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: settings },
      update: { value: settings },
    });
  } catch (err) {
    console.error("[settings] DB write failed — file fallback only", err);
  }
}

export async function getSettings(): Promise<Settings> {
  const fromDb = await readDbSettings();
  if (fromDb) return fromDb;
  return readFileSettings();
}

export async function updateSettings(
  partial: Partial<Settings>
): Promise<Settings> {
  const current = await getSettings();
  const merged = { ...current, ...partial };
  const parsed = SettingsSchema.safeParse(merged);
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
    );
  }
  await writeDbSettings(parsed.data);
  await writeFileSettings(parsed.data);
  return parsed.data;
}

/** Sync helper for root layout maintenance check */
export function getSettingsSyncFallback(): Settings {
  try {
    if (!existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
    const raw = readFileSync(SETTINGS_PATH, "utf-8");
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}
