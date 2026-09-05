// src/lib/auth/hash.ts
// Secure password hashing using bcrypt

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Default password for admin-created accounts — users change it after first login. */
export const DEFAULT_PASSWORD = "nexcard123";

/** Dummy hash so missing-user login still spends bcrypt time. */
const DUMMY_BCRYPT =
  "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquxi.Ss77VxDEBIVWc7aS";

function isLegacySha256Hash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function dummyPasswordCheck(plaintext: string): Promise<void> {
  await bcrypt.compare(plaintext, DUMMY_BCRYPT);
}

/**
 * Verifies a plaintext password against a stored hash.
 * Production rejects leftover SHA-256 hex hashes (seed/demo only).
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  if (isLegacySha256Hash(hash)) {
    if (process.env.NODE_ENV === "production") return false;
    const crypto = await import("crypto");
    const hashedPlaintext = crypto
      .createHash("sha256")
      .update(plaintext)
      .digest("hex");
    return hashedPlaintext === hash;
  }

  return bcrypt.compare(plaintext, hash);
}
