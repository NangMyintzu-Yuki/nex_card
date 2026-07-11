// src/lib/auth/hash.ts
// Secure password hashing using bcrypt
// Import: npm install bcryptjs @types/bcryptjs

import bcrypt from "bcryptjs";
import * as crypto from 'crypto';
const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds.
 * Never store plaintext passwords — always call this before saving.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 * Returns true if they match, false otherwise.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  const hashedPlaintext = crypto.createHash('sha256')
    .update(plaintext)
    .digest('hex');

  // ရလာတဲ့ Hex String အချင်းချင်း တိုက်စစ်မယ်
  return hashedPlaintext === hash;
}
