import { createHmac, randomBytes } from "crypto";

const SECRET = process.env.TWO_FACTOR_SECRET || process.env.SESSION_SECRET || "nex-card-2fa-default-secret-change-me";
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface TwoFactorPayload {
  userId: string;
  email: string;
  exp: number;
}

function base64url(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function debase64url(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createTwoFactorToken(userId: string, email: string): string {
  const payload: TwoFactorPayload = {
    userId,
    email,
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const encoded = base64url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyTwoFactorToken(token: string): { valid: true; userId: string; email: string } | { valid: false; error: string } {
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) {
      return { valid: false, error: "Invalid token format." };
    }

    const expectedSig = sign(encoded);
    if (signature !== expectedSig) {
      return { valid: false, error: "Invalid or tampered token." };
    }

    const payload: TwoFactorPayload = JSON.parse(debase64url(encoded));

    if (!payload.userId || !payload.email || !payload.exp) {
      return { valid: false, error: "Invalid token payload." };
    }

    if (Date.now() > payload.exp) {
      return { valid: false, error: "Token expired. Please log in again." };
    }

    return { valid: true, userId: payload.userId, email: payload.email };
  } catch {
    return { valid: false, error: "Invalid token." };
  }
}
