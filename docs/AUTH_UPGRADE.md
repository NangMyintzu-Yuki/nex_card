# Auth upgrade path (Phase C)

NEX CARD currently uses **custom cookie sessions** (`session_token` + Prisma `Session`).
That is intentional for MMK screenshot payments and simple ops.

## Keep (default)

- `src/lib/auth/session.ts`, `/api/auth/login|register|logout`
- Optional **admin TOTP 2FA** via `User.totpSecret` / `totpEnabled`

## When to migrate

Consider Auth.js v5 (Auth.js) or Lucia when you need:

- OAuth (Google / Apple)
- Passkeys
- Multi-device session UX out of the box

### Suggested Auth.js path

1. Keep `User` + `Session` tables (already Auth.js-shaped).
2. Add `@auth/prisma-adapter` + `next-auth@5`.
3. Map credentials provider to existing `hashedPassword` (`bcryptjs`).
4. Dual-read cookies during a 1–2 week cutover, then drop custom login routes.

### Lucia path

1. Add `lucia` + `@lucia-auth/adapter-prisma`.
2. Reuse `sessions.sessionToken` as Lucia session id.
3. Replace `getServerSession` internals; leave route handlers stable.

Do **not** migrate mid-launch without a staging dry-run of payment + admin gates.
