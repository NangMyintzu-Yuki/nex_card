// src/lib/mail/templates.ts
import { appBaseUrl } from "./mailer";

export function verifyEmailHtml(name: string, token: string, code?: string): string {
  const url = `${appBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  const codeSection = code ? `
      <div style="background:#f0f4ff;border:2px dashed #1a3a6b;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
        <p style="color:#333;font-size:13px;margin:0 0 8px">Your verification code:</p>
        <p style="font-size:32px;font-weight:900;letter-spacing:8px;color:#1a3a6b;margin:0">${code}</p>
        <p style="color:#999;font-size:11px;margin:8px 0 0">Expires in 5 minutes</p>
      </div>` : "";
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Verify your email</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Confirm your NEX CARD account by entering the code below or clicking the button.</p>
      ${codeSection}
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

export function paymentPendingApprovalHtml(
  adminName: string,
  userName: string,
  userEmail: string,
  tier: string,
  amount: number,
  currency: string,
  profileSlug: string
): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>New payment pending approval</h2>
      <p>Hi ${escapeHtml(adminName)},</p>
      <p>A new payment has been submitted and requires your review.</p>
      <div style="background:#fffbeb;border:1px solid #fbbf24;border-radius:12px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>User:</strong> ${escapeHtml(userName)} (${escapeHtml(userEmail)})</p>
        <p style="margin:0 0 8px"><strong>Tier:</strong> ${tier === "NFC_QR" ? "NFC + QR" : "QR Only"}</p>
        <p style="margin:0 0 8px"><strong>Amount:</strong> ${amount.toLocaleString()} ${currency}</p>
        <p style="margin:0"><strong>Profile:</strong> /${escapeHtml(profileSlug)}</p>
      </div>
      <p style="margin:28px 0">
        <a href="${appBaseUrl()}/admin/payments" style="background:#1a3a6b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">
          Review payment
        </a>
      </p>
    </div>`;
}

export function twoFactorEnabledHtml(name: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Two-factor authentication enabled</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>Two-factor authentication (2FA) has been successfully enabled on your NEX CARD account.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:16px;margin:20px 0">
        <p style="color:#166534;font-size:13px;margin:0">
          <strong>Your account is now more secure.</strong> You will need your authenticator app code each time you sign in.
        </p>
      </div>
      <p style="color:#666;font-size:12px">If you did not enable 2FA, please contact support immediately.</p>
      <p style="margin:28px 0">
        <a href="${appBaseUrl()}/dashboard" style="background:#1a3a6b;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">
          Open dashboard
        </a>
      </p>
    </div>`;
}

export function twoFactorFailedLoginHtml(name: string, ip?: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2>Failed login attempt</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>We detected a failed login attempt on your NEX CARD account with an invalid 2FA code.</p>
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:12px;padding:16px;margin:20px 0">
        <p style="color:#991b1b;font-size:13px;margin:0">
          <strong>Security alert:</strong> Someone attempted to sign in with your credentials but failed the 2FA verification.
          ${ip ? `<br/>IP Address: ${escapeHtml(ip)}` : ""}
        </p>
      </div>
      <p style="color:#666;font-size:12px">If this was you, try again with your correct authenticator code. If you suspect unauthorized access, change your password immediately.</p>
    </div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
