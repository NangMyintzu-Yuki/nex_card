// src/tests/actions/profile-actions.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateProfileAction } from "@/lib/actions/profile-actions";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/cache/profile-cache", () => ({
  purgeProfileCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const validCardJson = JSON.stringify({
  fullName: "Alex Rivera",
  jobTitle: "Designer",
  company: "NEX CARD",
  contacts: [{ type: "email", value: "alex@nexcard.io" }],
  socialLinks: [],
});

describe("updateProfileAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const result = await updateProfileAction(
      { status: "idle" },
      makeFormData({
        profileId: "clh3tqyxh0000qzrmn8k8x9y2",
        dynamicJsonData: validCardJson,
        isPublished: "false",
        ogImageUrl: "https://nexcard.io/og.png",
      })
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/unauthorized/i);
    }
  });

  it("blocks publishing premium profile without approved payment", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });

    vi.mocked(prisma.userProfile.findFirst).mockResolvedValue({
      id: "clh3tqyxh0000qzrmn8k8x9y2",
      slug: "alex",
      paymentStatus: "PENDING",
      category: { slug: "digital-name-card" },
      template: { isPremium: true },
    } as never);

    const result = await updateProfileAction(
      { status: "idle" },
      makeFormData({
        profileId: "clh3tqyxh0000qzrmn8k8x9y2",
        dynamicJsonData: validCardJson,
        isPublished: "true",
        ogImageUrl: "https://nexcard.io/og.png",
      })
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/payment must be approved/i);
    }
    expect(prisma.userProfile.update).not.toHaveBeenCalled();
  });

  it("allows publishing free template without payment", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
      },
    });

    vi.mocked(prisma.userProfile.findFirst).mockResolvedValue({
      id: "clh3tqyxh0000qzrmn8k8x9y2",
      slug: "alex",
      paymentStatus: null,
      category: { slug: "digital-name-card" },
      template: { isPremium: false },
    } as never);

    vi.mocked(prisma.userProfile.update).mockResolvedValue({} as never);

    const result = await updateProfileAction(
      { status: "idle" },
      makeFormData({
        profileId: "clh3tqyxh0000qzrmn8k8x9y2",
        dynamicJsonData: validCardJson,
        isPublished: "true",
        ogImageUrl: "https://nexcard.io/og.png",
      })
    );

    expect(result.status).toBe("success");
    expect(prisma.userProfile.update).toHaveBeenCalledOnce();
  });
});
