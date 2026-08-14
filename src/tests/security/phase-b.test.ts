// src/tests/security/phase-b.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettingsSchema } from "@/lib/settings";
import { isReservedSlug } from "@/lib/slugs/reserved";
import { rejectPaymentAction, approvePaymentAction } from "@/lib/actions/admin-actions";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/mail/mailer", () => ({
  sendMail: vi.fn().mockResolvedValue(null),
  isMailConfigured: vi.fn(() => false),
}));

describe("Phase B — settings & reserved slugs", () => {
  it("validates platform settings schema", () => {
    const parsed = SettingsSchema.safeParse({
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
      wallet_account_name: "NEX CARD",
      wallet_kbzpay: "09-000000000",
      wallet_wavepay: "09-000000000",
      wallet_ayapay: "09-000000000",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid max_profiles_per_user", () => {
    const parsed = SettingsSchema.safeParse({
      site_name: "NEX CARD",
      site_url: "https://nexcard.io",
      support_email: "support@nexcard.io",
      maintenance_mode: false,
      allow_registration: true,
      require_email_verify: false,
      max_profiles_per_user: 0,
      enable_og_images: true,
      enable_analytics: true,
      enable_r2_uploads: true,
      isr_revalidate_sec: 3600,
      notify_new_user: true,
      notify_email: "admin@nexcard.io",
    });
    expect(parsed.success).toBe(false);
  });

  it("reserves auth-related slugs", () => {
    expect(isReservedSlug("forgot-password")).toBe(true);
    expect(isReservedSlug("reset-password")).toBe(true);
    expect(isReservedSlug("verify-email")).toBe(true);
  });
});

describe("Phase B — payment reject requires PENDING", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN", email: "a@x.com", name: "Admin" },
    } as never);
    process.env.DATABASE_URL = "";
  });

  it("rejects non-pending payments", async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "pay-1",
      userId: "user-1",
      userProfileId: "prof-1",
      status: "APPROVED",
    } as never);

    const fd = new FormData();
    fd.set("paymentId", "pay-1");
    const result = await rejectPaymentAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/pending/i);
    }
  });

  it("approves only pending payments", async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: "pay-2",
      userId: "user-1",
      userProfileId: "prof-1",
      status: "REJECTED",
    } as never);

    const fd = new FormData();
    fd.set("paymentId", "pay-2");
    const result = await approvePaymentAction({ status: "idle" }, fd);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/pending/i);
    }
  });
});
