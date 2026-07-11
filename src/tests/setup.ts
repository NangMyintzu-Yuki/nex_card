// src/tests/setup.ts
// Global test setup — runs before every test file

import { beforeAll, afterAll, vi } from "vitest";

// Mock next/cache to prevent import errors outside Next.js runtime
vi.mock("next/cache", () => ({
  revalidateTag:  vi.fn(),
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
    user:        { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    session:     { findUnique: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    category:    { findUnique: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    template:    { findFirst: vi.fn(), findMany: vi.fn(), upsert: vi.fn() },
    userProfile: { findUnique: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), upsert: vi.fn(), delete: vi.fn(), count: vi.fn(), aggregate: vi.fn() },
  },
}));
