// src/lib/mail/mailer.ts
// Unified transactional email
// Priority: Resend API (HTTP/443) → SMTP (port 465/587)
//
// Set RESEND_API_KEY in .env to use Resend (recommended if VPS blocks SMTP).
// Get free API key at https://resend.com (100 emails/day).

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

// ── Resend API (HTTP — works through any firewall) ───────────────────────────

function resendApiKey(): string | undefined {
  return process.env.RESEND_API_KEY?.trim();
}

function resendFrom(): string {
  return process.env.RESEND_FROM?.trim() || "NEX CARD <onboarding@resend.dev>";
}

async function sendViaResend(input: SendMailInput): Promise<{ messageId: string } | null> {
  const apiKey = resendApiKey();
  if (!apiKey) return null;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { id: string };
  return { messageId: data.id };
}

// ── SMTP fallback (nodemailer) ───────────────────────────────────────────────

function smtpHost(): string | undefined {
  return process.env.SMTP_HOST?.trim();
}

function smtpUser(): string | undefined {
  return process.env.SMTP_USER?.trim();
}

function smtpPass(): string | undefined {
  return process.env.SMTP_PASS?.trim();
}

function isSmtpConfigured(): boolean {
  return Boolean(smtpHost() && smtpUser() && smtpPass());
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured.");
  }
  if (!transporter) {
    const port = Number(
      process.env.SMTP_PORT ?? 465
    );
    transporter = nodemailer.createTransport({
      host: smtpHost(),
      port,
      secure: port === 465,
      auth: { user: smtpUser()!, pass: smtpPass()! },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  }
  return transporter;
}

async function sendViaSmtp(input: SendMailInput): Promise<{ messageId: string } | null> {
  if (!isSmtpConfigured()) return null;

  const fromEmail =
    process.env.SMTP_USER?.trim() ||
    smtpUser() ||
    "noreply@www.nexcard.wetechmm.com";

  const info = await getTransporter().sendMail({
    from: `"NEX CARD" <${fromEmail}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { messageId: info.messageId };
}

// ── Public API ───────────────────────────────────────────────────────────────

export function isMailConfigured(): boolean {
  return Boolean(resendApiKey()) || isSmtpConfigured();
}

export async function sendMail(input: SendMailInput): Promise<{ messageId: string } | null> {
  if (!isMailConfigured()) {
    console.warn("[mail] No email provider configured — skipped:", input.subject, "→", input.to);
    return null;
  }

  // 1. Try Resend API first (HTTP — works through firewalls)
  if (resendApiKey()) {
    try {
      const result = await sendViaResend(input);
      console.log("[mail] Sent via Resend:", input.subject, "→", input.to);
      return result;
    } catch (error) {
      console.error("[mail] Resend failed:", input.subject, "→", input.to, error);
      // Fall through to SMTP
    }
  }

  // 2. Fallback to SMTP
  if (isSmtpConfigured()) {
    try {
      const result = await sendViaSmtp(input);
      console.log("[mail] Sent via SMTP:", input.subject, "→", input.to);
      return result;
    } catch (error) {
      console.error("[mail] SMTP failed:", input.subject, "→", input.to, error);
      transporter = null; // Reset so next attempt reconnects
      return null;
    }
  }

  return null;
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
