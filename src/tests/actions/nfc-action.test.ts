// src/tests/actions/nfc-action.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { markNfcProgrammedAction } from "@/lib/actions/nfc-action";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function makeFormData(profileId: string): FormData {
  const fd = new FormData();
  fd.set("profileId", profileId);
  return fd;
}

describe("markNfcProgrammedAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects QR-only tier", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
        totpEnabled: false,
      },
    });

    vi.mocked(prisma.userProfile.findFirst).mockResolvedValue({
      id: "clh3tqyxh0000qzrmn8k8x9y2",
      slug: "alex",
      isPublished: true,
      paymentStatus: "APPROVED",
      nfcWriteCount: BigInt(0),
      payment: { tier: "QR_ONLY", status: "APPROVED" },
    } as never);

    const result = await markNfcProgrammedAction(
      { status: "idle" },
      makeFormData("clh3tqyxh0000qzrmn8k8x9y2")
    );

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/does not include NFC/i);
    }
  });

  it("records NFC programming for NFC tier", async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Alex",
        email: "alex@nexcard.io",
        role: "USER",
        avatarUrl: null,
        totpEnabled: false,
      },
    });

    vi.mocked(prisma.userProfile.findFirst).mockResolvedValue({
      id: "clh3tqyxh0000qzrmn8k8x9y2",
      slug: "alex",
      isPublished: true,
      paymentStatus: "APPROVED",
      nfcWriteCount: BigInt(0),
      payment: { tier: "NFC_CARD", status: "APPROVED" },
    } as never);

    vi.mocked(prisma.userProfile.update).mockResolvedValue({
      nfcWriteCount: BigInt(1),
      nfcProgrammedAt: new Date("2026-07-16T10:00:00Z"),
    } as never);

    const result = await markNfcProgrammedAction(
      { status: "idle" },
      makeFormData("clh3tqyxh0000qzrmn8k8x9y2")
    );

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.nfcWriteCount).toBe(1);
    }
    expect(prisma.userProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "clh3tqyxh0000qzrmn8k8x9y2" },
        data: expect.objectContaining({
          nfcWriteCount: { increment: 1 },
        }),
      })
    );
  });
});
