// src/tests/setup.ts
// Global test setup — runs before every test file

import { beforeAll, afterAll, vi } from "vitest";

// Mock next/cache to prevent import errors outside Next.js runtime
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
  headers: vi.fn(() => new Map()),
}));

// Mock Prisma for unit tests — integration tests use a real DB
vi.mock("@/lib/db/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    category: { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    template: { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    userProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    emailToken: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: { create: vi.fn(), findMany: vi.fn() },
    systemSetting: { findUnique: vi.fn(), upsert: vi.fn() },
    profileAnalyticsEvent: { create: vi.fn(), findMany: vi.fn() },
    weddingRsvp: {
      create: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    weddingGuestbook: { create: vi.fn(), findMany: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => {
      const tx = {
        payment: {
          findUnique: vi.fn(),
          update: vi.fn(),
          create: vi.fn(),
          deleteMany: vi.fn(),
        },
        userProfile: { update: vi.fn() },
      };
      return fn(tx);
    }),
  },
}));

vi.mock("@/lib/settings", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/settings")>();
  return {
    ...actual,
    getSettings: vi.fn().mockResolvedValue({
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
      notify_new_user: false,
      notify_email: "admin@nexcard.io",
    }),
  };
});
