import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';
import { AppError, toAppError } from '@/lib/errors';
import { runGeneration } from '@/lib/generate';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();

    const body = (await req.json().catch(() => null)) as {
      toolId?: string;
      inputs?: unknown;
    } | null;

    if (!body?.toolId) {
      throw new AppError('validation', 'Missing toolId.');
    }

    const result = await runGeneration({
      workspaceId: user.id,
      toolId: body.toolId,
      inputs: body.inputs,
    });

    return NextResponse.json(result);
  } catch (err) {
    const appErr = toAppError(err);
    if (appErr.status >= 500) {
      console.error('[api/generate]', appErr.code, appErr.message);
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
