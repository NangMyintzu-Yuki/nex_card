// src/lib/analytics/track.ts
import prisma from "@/lib/db/prisma";
import type { AnalyticsEventType } from "@prisma/client";

export function detectDevice(ua: string | null | undefined): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/bot|crawl|spider|slurp|facebookexternalhit/i.test(s)) return "bot";
  if (/ipad|tablet|kindle|playbook/i.test(s)) return "tablet";
  if (/mobi|iphone|android.*mobile|windows phone/i.test(s)) return "mobile";
  return "desktop";
}

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function trackProfileEvent(input: {
  profileId: string;
  type: AnalyticsEventType;
  referrer?: string | null;
  userAgent?: string | null;
}): void {
  const referrer = input.referrer?.slice(0, 500) || null;
  const userAgent = input.userAgent?.slice(0, 500) || null;
  const device = detectDevice(userAgent);

  prisma.profileAnalyticsEvent
    .create({
      data: {
        profileId: input.profileId,
        type: input.type,
        referrer,
        userAgent,
        device,
        day: utcDay(),
      },
    })
    .catch((err) => {
      console.error("[analytics] track failed", err);
    });
}

export async function getProfileAnalyticsSummary(
  profileIds: string[],
  days = 30
) {
  if (profileIds.length === 0) {
    return { daily: [], referrers: [], devices: [] };
  }

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const events = await prisma.profileAnalyticsEvent.findMany({
    where: {
      profileId: { in: profileIds },
      createdAt: { gte: since },
    },
    select: {
      type: true,
      day: true,
      referrer: true,
      device: true,
    },
  });

  const dailyMap = new Map<string, { views: number; qr: number; nfc: number }>();
  const referrerMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();

  for (const e of events) {
    const bucket = dailyMap.get(e.day) ?? { views: 0, qr: 0, nfc: 0 };
    if (e.type === "VIEW") bucket.views += 1;
    else if (e.type === "QR_SCAN") bucket.qr += 1;
    else if (e.type === "NFC_TAP") bucket.nfc += 1;
    dailyMap.set(e.day, bucket);

    if (e.referrer) {
      let host = e.referrer;
      try {
        host = new URL(e.referrer).hostname || e.referrer;
      } catch {
        /* keep raw */
      }
      referrerMap.set(host, (referrerMap.get(host) ?? 0) + 1);
    }

    const device = e.device || "unknown";
    deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);
  }

  const daily = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, counts]) => ({ day, ...counts }));

  const referrers = [...referrerMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([host, count]) => ({ host, count }));

  const devices = [...deviceMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([device, count]) => ({ device, count }));

  return { daily, referrers, devices };
}
