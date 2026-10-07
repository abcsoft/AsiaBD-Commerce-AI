import { NextResponse } from 'next/server';
import { isDemoMode } from '@/lib/ai/claude';
import { requireApiUser } from '@/lib/auth';
import { getOverview } from '@/lib/db';
import { toAppError } from '@/lib/errors';
import type { ApiErrorPayload, OverviewResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireApiUser();
    const data = getOverview(user.id);

    const response: OverviewResponse = {
      ...data,
      demoMode: isDemoMode(),
      user: { name: user.name, email: user.email },
    };
    return NextResponse.json(response);
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}
