import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/errors';
import { getDb, getOrCreateWorkspace } from '@/lib/db';

export const AUTH_COOKIE = 'asiabd_auth';
const SESSION_DAYS = 30;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/* -------------------------------- passwords ------------------------------- */

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt:${SCRYPT.N}:${SCRYPT.r}:${SCRYPT.p}:${salt}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, nRaw, rRaw, pRaw, salt, hashHex] = stored.split(':');
    if (scheme !== 'scrypt' || !nRaw || !rRaw || !pRaw || !salt || !hashHex) {
      return false;
    }
    const expected = Buffer.from(hashHex, 'hex');
    const computed = scryptSync(password, salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
    });
    return (
      expected.length === computed.length && timingSafeEqual(expected, computed)
    );
  } catch {
    return false;
  }
}

/* ---------------------------------- users --------------------------------- */

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
}

export function getUserByEmail(email: string): UserRow | null {
  const d = getDb();
  return (
    (d
      .prepare(
        'SELECT id, email, name, password_hash FROM users WHERE email = ?'
      )
      .get(email.trim().toLowerCase()) as UserRow | undefined) ?? null
  );
}

export function createUser(params: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): AuthUser {
  const d = getDb();
  const email = params.email.trim().toLowerCase();

  const existing = d
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email);
  if (existing) {
    throw new AppError(
      'conflict',
      'An account with this email already exists. Try signing in instead.'
    );
  }

  const id = randomUUID();
  const name =
    `${params.firstName.trim()} ${params.lastName.trim()}`.trim() || email;

  try {
    d.prepare(
      'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(id, email, name, hashPassword(params.password), new Date().toISOString());
  } catch (err) {
    if (String(err).includes('UNIQUE')) {
      throw new AppError(
        'conflict',
        'An account with this email already exists. Try signing in instead.'
      );
    }
    throw err;
  }

  // A user's workspace is keyed by the user id - 50 welcome credits + demo seeds.
  getOrCreateWorkspace(id);

  return { id, email, name };
}

export function verifyCredentials(
  email: string,
  password: string
): AuthUser | null {
  const row = getUserByEmail(email);
  if (!row) return null;
  if (!verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, email: row.email, name: row.name };
}

/* -------------------------------- sessions -------------------------------- */

export function createAuthSession(userId: string): {
  token: string;
  expiresAt: string;
} {
  const d = getDb();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  d.prepare(
    'INSERT INTO auth_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).run(token, userId, new Date().toISOString(), expiresAt);
  return { token, expiresAt };
}

export function getSessionUser(token: string): AuthUser | null {
  const d = getDb();
  const row = d
    .prepare(
      `SELECT s.expires_at, u.id, u.email, u.name
       FROM auth_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as
    | { expires_at: string; id: string; email: string; name: string }
    | undefined;

  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    try {
      d.prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
    } catch {
      /* ignore */
    }
    return null;
  }

  return { id: row.id, email: row.email, name: row.name };
}

export function deleteAuthSession(token: string) {
  getDb().prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
}

/**
 * Cookie policy: httpOnly always; `secure` only in production when APP_URL is
 * https - so local http development keeps working.
 */
export function authCookieOptions(maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  const secure =
    process.env.NODE_ENV === 'production' &&
    (process.env.APP_URL ?? '').startsWith('https://');
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
    secure,
  };
}

/* --------------------------- server-side helpers -------------------------- */

export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return getSessionUser(token);
}

/** For server components: redirects to /signin when not authenticated. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user) return user;

  const h = await headers();
  const path = h.get('x-asiabd-pathname') || '/dashboard';
  redirect(`/signin?next=${encodeURIComponent(path)}`);
}

/** For route handlers: throws 401 when not authenticated. */
export async function requireApiUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError('unauthorized', 'Please sign in to continue.');
  }
  return user;
}
