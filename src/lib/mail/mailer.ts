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
    process.env.SMTP_FROM?.trim() ||
    smtpUser() ||
    "noreply@nexcard.io";

  const info = await getTransporter().sendMail({
    from: `"NEX CARD" <${fromEmail}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });

  return { messageId: info.messageId };
}

export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
