import { NextResponse } from 'next/server';
import { AppError, toAppError } from '@/lib/errors';
import {
  AUTH_COOKIE,
  authCookieOptions,
  createAuthSession,
  verifyCredentials,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      email?: unknown;
      password?: unknown;
    } | null;

    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      throw new AppError('validation', 'Email and password are required.');
    }

    const rl = checkRateLimit(`signin:${email.toLowerCase()}`, 8, 60_000);
    if (!rl.ok) {
      throw new AppError(
        'rate_limited',
        `Too many attempts - wait ${rl.retryAfter}s and try again.`,
        { retryAfter: rl.retryAfter }
      );
    }

    const user = verifyCredentials(email, password);
    if (!user) {
      throw new AppError('unauthorized', 'Invalid email or password.');
    }

    const { token } = createAuthSession(user.id);

    const res = NextResponse.json({
      user: { name: user.name, email: user.email },
    });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return res;
  } catch (err) {
    const appErr = toAppError(err);
    const retryAfter = (appErr.details as { retryAfter?: number } | undefined)
      ?.retryAfter;
    const payload: ApiErrorPayload = {
      error: {
        code: appErr.code,
        message: appErr.message,
        ...(retryAfter ? { retryAfter } : {}),
      },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}
