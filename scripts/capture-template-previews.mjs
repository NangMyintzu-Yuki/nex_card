// scripts/capture-template-previews.mjs
// Captures full-page screenshots of templates via the public /preview/[code] route.
// Mobile (430px) for all templates. Desktop (1440px) for portfolio, business, wedding.
//
// Usage:
//   node scripts/capture-template-previews.mjs

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:4000";
const OUTPUT_DIR = path.resolve(process.cwd(), "template-previews");
const DESKTOP_DIR = path.join(OUTPUT_DIR, "desktop");

const MOBILE_TEMPLATES = [
  { code: "digital-card-aurora",     name: "Aurora",     category: "name-card" },
  { code: "digital-card-obsidian",   name: "Obsidian",   category: "name-card" },
  { code: "digital-card-prism",      name: "Prism",      category: "name-card" },
  { code: "digital-card-coral",      name: "Coral",      category: "name-card" },
  { code: "digital-card-titanium",   name: "Titanium",   category: "name-card" },
  { code: "portfolio-canvas",        name: "Canvas",     category: "portfolio" },
  { code: "portfolio-studio",        name: "Studio",     category: "portfolio" },
  { code: "portfolio-forge",         name: "Forge",      category: "portfolio" },
  { code: "portfolio-spectrum",      name: "Spectrum",   category: "portfolio" },
  { code: "portfolio-blueprint",     name: "Blueprint",  category: "portfolio" },
  { code: "business-marquee",        name: "Marquee",    category: "business" },
  { code: "business-district",       name: "District",   category: "business" },
  { code: "business-empire",         name: "Empire",     category: "business" },
  { code: "business-neon",           name: "Neon",       category: "business" },
  { code: "business-vault",          name: "Vault",      category: "business" },
  { code: "wedding-eternal",         name: "Eternal",    category: "wedding" },
  { code: "wedding-blossom",         name: "Blossom",    category: "wedding" },
  { code: "wedding-noir",            name: "Noir",       category: "wedding" },
  { code: "wedding-celestial",       name: "Celestial",  category: "wedding" },
  { code: "wedding-rustic",          name: "Rustic",     category: "wedding" },
];

const DESKTOP_TEMPLATES = MOBILE_TEMPLATES.filter(
  (t) => t.category !== "name-card"
);

async function captureBatch(context, templates, label, outputDir) {
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const page = await context.newPage();
  let success = 0;
  let failed = 0;

  console.log(`\n📸 ${label} (${templates.length} templates)…`);

  for (const tpl of templates) {
    const url = `${BASE_URL}/preview/${tpl.code}`;
    const filePath = path.join(outputDir, `${tpl.name.toLowerCase()}.png`);

    try {
      process.stdout.write(`  ${tpl.name}…`);

      const response = await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30_000,
      });

      if (!response || !response.ok()) {
        console.log(` ✗ HTTP ${response?.status() ?? "no response"}`);
        failed++;
        continue;
      }

      await page.waitForTimeout(2000);

      await page.screenshot({ path: filePath, fullPage: true });

      console.log(` ✓`);
      success++;
    } catch (err) {
      console.log(` ✗ ${err.message}`);
      failed++;
    }
  }

  await page.close();
  return { success, failed };
}

async function main() {
  console.log(`\n📸 NEX CARD Template Preview Captures`);
  console.log(`   Base URL: ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true, channel: "chrome" });

  // ── Mobile captures (all 20) ──────────────────────────────────────────
  const mobileCtx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
  });
  const mobile = await captureBatch(
    mobileCtx,
    MOBILE_TEMPLATES,
    "Mobile (430px)",
    OUTPUT_DIR
  );
  await mobileCtx.close();

  // ── Desktop captures (portfolio, business, wedding = 15) ──────────────
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const desktop = await captureBatch(
    desktopCtx,
    DESKTOP_TEMPLATES,
    "Desktop (1440px)",
    DESKTOP_DIR
  );
  await desktopCtx.close();

  await browser.close();

  console.log(`\n✅ Done`);
  console.log(`   Mobile:  ${mobile.success} captured, ${mobile.failed} failed → ${OUTPUT_DIR}`);
  console.log(`   Desktop: ${desktop.success} captured, ${desktop.failed} failed → ${DESKTOP_DIR}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
