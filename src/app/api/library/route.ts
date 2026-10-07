import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';
import { insertSavedItem, listSavedItems } from '@/lib/db';
import { AppError, toAppError } from '@/lib/errors';
import { isToolId } from '@/lib/tools/registry';
import type { ApiErrorPayload } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireApiUser();

    const url = new URL(req.url);
    const toolId = url.searchParams.get('toolId') ?? undefined;
    const marketplace = url.searchParams.get('marketplace') ?? undefined;
    const q = url.searchParams.get('q') ?? undefined;

    const items = listSavedItems(user.id, { toolId, marketplace, q });
    return NextResponse.json({ items });
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireApiUser();

    const body = (await req.json().catch(() => null)) as {
      toolId?: string;
      title?: string;
      content?: unknown;
      marketplace?: string;
      tags?: unknown;
      generationId?: string;
    } | null;

    if (!body) throw new AppError('validation', 'Invalid JSON body.');
    if (!body.toolId || !isToolId(body.toolId)) {
      throw new AppError('validation', 'Invalid toolId.');
    }

    const content =
      typeof body.content === 'string'
        ? body.content
        : JSON.stringify(body.content ?? null);

    if (!content || content.length < 2) {
      throw new AppError('validation', 'Content is required.');
    }
    if (content.length > 100_000) {
      throw new AppError('validation', 'Content is too large to save.');
    }

    let title = (body.title ?? '').toString().trim();
    if (!title) title = 'Saved output';
    if (title.length > 200) title = title.slice(0, 200);

    const tags = Array.isArray(body.tags)
      ? (body.tags as unknown[])
          .filter((t): t is string => typeof t === 'string')
          .map((t) => t.trim().slice(0, 40))
          .filter(Boolean)
          .slice(0, 10)
      : [];

    const item = insertSavedItem({
      workspaceId: user.id,
      toolId: body.toolId,
      title,
      content,
      marketplace: typeof body.marketplace === 'string' ? body.marketplace : null,
      tags,
      generationId:
        typeof body.generationId === 'string' ? body.generationId : null,
    });

    return NextResponse.json({ item });
  } catch (err) {
    const appErr = toAppError(err);
    const payload: ApiErrorPayload = {
      error: { code: appErr.code, message: appErr.message },
    };
    return NextResponse.json(payload, { status: appErr.status });
  }
}
