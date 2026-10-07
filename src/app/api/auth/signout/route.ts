import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE,
  authCookieOptions,
  deleteAuthSession,
  getAuthToken,
} from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const token = await getAuthToken();
  if (token) {
    try {
      deleteAuthSession(token);
    } catch (err) {
      console.error('[api/auth/signout]', err);
    }
  }

  const res = NextResponse.json({ ok: true });
  // Expire the cookie (maxAge 0).
  res.cookies.set(AUTH_COOKIE, '', authCookieOptions(0));
  return res;
}
