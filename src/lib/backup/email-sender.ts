// src/lib/backup/email-sender.ts — Send backup via email with nodemailer
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) ?? 465,
  secure: true,
  auth: {
    user: process.env.SYSTEM_MAIL_USER,
    pass: process.env.SYSTEM_MAIL_PASSWORD,
  },
});

interface SendBackupEmailOpts {
  compressedSql: Buffer;
  filename: string;
  stats: {
    users: number;
    sessions: number;
    categories: number;
    templates: number;
    profiles: number;
    payments: number;
    sizeRaw: number;
    sizeCompressed: number;
  };
}

export async function sendBackupEmail(opts: SendBackupEmailOpts) {
  const { compressedSql, filename, stats } = opts;
  const date = new Date().toISOString().slice(0, 10);
  const reduction = Math.round((1 - stats.sizeCompressed / stats.sizeRaw) * 100);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1a1a1a; margin-bottom: 8px;">NEX CARD Weekly Backup</h2>
      <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Automated database backup for ${date}</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; color: #888;">Users</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.users}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Sessions</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.sessions}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Categories</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.categories}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Templates</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.templates}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Profiles</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.profiles}</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Payments</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${stats.payments}</td></tr>
        <tr><td colspan="2" style="padding: 8px 0; border-top: 1px solid #eee;"></td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Raw size</td><td style="padding: 8px 0; text-align: right;">${(stats.sizeRaw / 1024).toFixed(1)} KB</td></tr>
        <tr><td style="padding: 8px 0; color: #888;">Compressed</td><td style="padding: 8px 0; text-align: right;">${(stats.sizeCompressed / 1024).toFixed(1)} KB (${reduction}% reduced)</td></tr>
      </table>

      <p style="color: #888; font-size: 12px;">SQL file attached as <strong>${filename}</strong>. Import with: <code>mysql -u root -p database &lt; ${filename}</code></p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"NEX CARD Backup" <${process.env.SYSTEM_MAIL_USER}>`,
    to: process.env.SYSTEM_MAIL_USER,
    subject: `[NEX CARD] Weekly Database Backup — ${date}`,
    html,
    attachments: [
      {
        filename,
        content: compressedSql,
        contentType: "application/gzip",
      },
    ],
  });

  return info.messageId;
}
