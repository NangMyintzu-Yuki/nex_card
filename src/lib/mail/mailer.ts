// src/lib/mail/mailer.ts
// Unified transactional email (SMTP_USER/PASS with SYSTEM_MAIL_* fallback)

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function smtpHost(): string | undefined {
  return process.env.SMTP_HOST?.trim() || process.env.SYSTEM_MAIL_HOST?.trim();
}

function smtpUser(): string | undefined {
  return process.env.SMTP_USER?.trim() || process.env.SYSTEM_MAIL_USER?.trim();
}

function smtpPass(): string | undefined {
  return (
    process.env.SMTP_PASS?.trim() ||
    process.env.SYSTEM_MAIL_PASS?.trim() ||
    process.env.SYSTEM_MAIL_PASSWORD?.trim()
  );
}

export function isMailConfigured(): boolean {
  return Boolean(smtpHost() && smtpUser() && smtpPass());
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!isMailConfigured()) {
    throw new Error("SMTP is not configured (SMTP_HOST + SMTP_USER/PASS or SYSTEM_MAIL_*).");
  }
  if (!transporter) {
    const port = Number(
      process.env.SMTP_PORT ?? process.env.SYSTEM_MAIL_PORT ?? 465
    );
    transporter = nodemailer.createTransport({
      host: smtpHost(),
      port,
      secure: port === 465,
      auth: {
        user: smtpUser(),
        pass: smtpPass(),
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });
  }
  return transporter;
}

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail(input: SendMailInput): Promise<{ messageId: string } | null> {
  if (!isMailConfigured()) {
    console.warn("[mail] SMTP not configured — skipped:", input.subject, "→", input.to);
    return null;
  }

  const fromEmail =
    process.env.SMTP_USER?.trim() ||
    smtpUser() ||
    "noreply@www.nexcard.wetechmm.com";

  try {
    const info = await getTransporter().sendMail({
      from: `"NEX CARD" <${fromEmail}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    console.log("[mail] Sent:", input.subject, "→", input.to, "(id:", info.messageId, ")");
    return { messageId: info.messageId };
  } catch (error) {
    console.error("[mail] Failed to send:", input.subject, "→", input.to, error);
    // Reset transporter on connection errors so it reconnects on next attempt
    if (error instanceof Error && (
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ESOCKET") ||
      error.message.includes("ECONNRESET")
    )) {
      transporter = null;
      console.warn("[mail] Transporter reset due to connection error");
    }
    return null;
  }
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
