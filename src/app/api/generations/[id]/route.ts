import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';
import { AppError, toAppError } from '@/lib/errors';
import { getGenerationDetail } from '@/lib/generation-detail';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const detail = getGenerationDetail(user.id, id);
    if (!detail) throw new AppError('not_found', 'Generation not found.');

    return NextResponse.json(detail);
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}
