import { NextResponse } from 'next/server';
import { AppError, toAppError } from '@/lib/errors';
import {
  AUTH_COOKIE,
  authCookieOptions,
  createAuthSession,
  createUser,
} from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { authValidation } from '@/lib/zod/auth.schema';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body) throw new AppError('validation', 'Invalid request body.');

    const parsed = authValidation.register.safeParse({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
    });
    if (!parsed.success) {
      throw new AppError(
        'validation',
        parsed.error.issues[0]?.message ?? 'Invalid input.'
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const rl = checkRateLimit(`signup:${email}`, 8, 60_000);
    if (!rl.ok) {
      throw new AppError(
        'rate_limited',
        `Too many attempts - wait ${rl.retryAfter}s and try again.`,
        { retryAfter: rl.retryAfter }
      );
    }

    const user = createUser(parsed.data);
    const { token } = createAuthSession(user.id);

    const res = NextResponse.json({
      user: { name: user.name, email: user.email },
    });
    res.cookies.set(AUTH_COOKIE, token, authCookieOptions());
    return res;
  } catch (err) {
    const appErr = toAppError(err);
    if (appErr.status >= 500) {
      console.error('[api/auth/signup]', appErr.code, appErr.message);
    }
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
