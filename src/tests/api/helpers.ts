// src/tests/api/helpers.ts
// Shared helpers for API route unit tests

import { NextRequest } from "next/server";
import { vi } from "vitest";

export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export function getRequest(url: string): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

export async function readJson<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function mockSession(user: {
  id: string;
  name?: string;
  email?: string;
  role?: "USER" | "ADMIN";
} | null) {
  vi.doMock("@/lib/auth/session", () => ({
    getServerSession: vi.fn().mockResolvedValue(
      user
        ? {
            user: {
              id: user.id,
              name: user.name ?? "Test User",
              email: user.email ?? "test@www.nexcard.wetechmm.com",
              role: user.role ?? "USER",
              avatarUrl: null,
              totpEnabled: false,
            },
          }
        : null
    ),
  }));
}
