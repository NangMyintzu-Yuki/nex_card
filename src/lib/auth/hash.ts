// src/lib/auth/hash.ts
// Secure password hashing using bcrypt

import bcrypt from "bcryptjs";
import * as crypto from "crypto";

const SALT_ROUNDS = 12;

/** Returns true if the stored hash is a legacy SHA-256 hex digest (seed data). */
function isLegacySha256Hash(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 * Never store plaintext passwords — always call this before saving.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored hash.
 * Supports bcrypt (production) and legacy SHA-256 hex (seed/demo data).
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  if (isLegacySha256Hash(hash)) {
    const hashedPlaintext = crypto
      .createHash("sha256")
      .update(plaintext)
      .digest("hex");
    return hashedPlaintext === hash;
  }

  return bcrypt.compare(plaintext, hash);
}
