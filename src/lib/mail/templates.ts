// src/lib/mail/templates.ts
import { appBaseUrl } from "./mailer";

export function verifyEmailHtml(name: string, token: string): string {
  const url = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Verify your email</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Confirm your NEX CARD account by clicking the button below.</p>
      <p style="margin:28px 0">
        <a href="${url}" style="background:#1a3a6b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">
          Verify email
        </a>
      </p>
      <p style="color:#666;font-size:12px">Or open: ${url}</p>
      <p style="color:#666;font-size:12px">This link expires in 24 hours.</p>
    </div>`;
}

export function resetPasswordHtml(name: string, token: string): string {
  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Reset your password</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your NEX CARD password.</p>
      <p style="margin:28px 0">
        <a href="${url}" style="background:#1a3a6b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">
          Choose new password
        </a>
      </p>
      <p style="color:#666;font-size:12px">Or open: ${url}</p>
      <p style="color:#666;font-size:12px">If you did not request this, ignore this email. Link expires in 1 hour.</p>
    </div>`;
}

export function paymentStatusHtml(
  name: string,
  status: "APPROVED" | "REJECTED",
  note?: string | null
): string {
  const ok = status === "APPROVED";
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Payment ${ok ? "approved" : "rejected"}</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>${
        ok
          ? "Your payment was approved. You can now edit and publish your NEX CARD profile."
          : "Your payment was rejected. Please resubmit a clearer screenshot from your dashboard."
      }</p>
      ${note ? `<p><strong>Note:</strong> ${escapeHtml(note)}</p>` : ""}
      <p style="margin:28px 0">
        <a href="${appBaseUrl()}/dashboard" style="background:#1a3a6b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">
          Open dashboard
        </a>
      </p>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
