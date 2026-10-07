import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';
import { deleteSavedItem, updateSavedItem } from '@/lib/db';
import { AppError, toAppError } from '@/lib/errors';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const body = (await req.json().catch(() => null)) as {
      title?: string;
      content?: unknown;
      tags?: unknown;
    } | null;
    if (!body) throw new AppError('validation', 'Invalid JSON body.');

    const content =
      body.content === undefined
        ? undefined
        : typeof body.content === 'string'
          ? body.content
          : JSON.stringify(body.content);

    if (content !== undefined && content.length > 100_000) {
      throw new AppError('validation', 'Content is too large to save.');
    }

    const tags = Array.isArray(body.tags)
      ? (body.tags as unknown[])
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 10)
      : undefined;

    const item = updateSavedItem(user.id, id, {
      title: typeof body.title === 'string' ? body.title.slice(0, 200) : undefined,
      content,
      tags,
    });

    if (!item) throw new AppError('not_found', 'Item not found.');
    return NextResponse.json({ item });
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;

    const deleted = deleteSavedItem(user.id, id);
    if (!deleted) throw new AppError('not_found', 'Item not found.');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}
