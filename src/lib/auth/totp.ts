// src/lib/auth/totp.ts — minimal RFC 6238 TOTP for optional admin 2FA
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(bytes = 20): string {
  const buf = randomBytes(bytes);
  let bits = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    out += BASE32[parseInt(chunk, 2)];
  }
  return out;
}

function base32Decode(secret: string): Buffer {
  const cleaned = secret.replace(/=+$/, "").toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const c of cleaned) {
    const val = BASE32.indexOf(c);
    if (val < 0) continue;
    bits += val.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number, digits = 6): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

export function generateTotp(secretBase32: string, step = 30, digits = 6): string {
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / step);
  return hotp(secret, counter, digits);
}

export function verifyTotp(
  secretBase32: string,
  token: string,
  window = 1,
  step = 30
): boolean {
  const cleaned = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let w = -window; w <= window; w++) {
    const expected = hotp(secret, counter + w);
    const a = Buffer.from(expected);
    const b = Buffer.from(cleaned);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export function totpOtpauthUrl(opts: {
  secret: string;
  email: string;
  issuer?: string;
}): string {
  const issuer = encodeURIComponent(opts.issuer ?? "NEX CARD");
  const label = encodeURIComponent(`${opts.issuer ?? "NEX CARD"}:${opts.email}`);
  return `otpauth://totp/${label}?secret=${opts.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
