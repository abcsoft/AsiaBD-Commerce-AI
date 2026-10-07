'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { copyText } from '@/lib/export';
import { buildExportText, suggestSavedTitle } from '@/lib/output-utils';
import { TOOL_BY_ID } from '@/lib/tools/registry';
import type { GenerationSummary } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

type Rec = Record<string, unknown>;

export default function RecentGenerations({
  items,
}: {
  items: GenerationSummary[];
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const withDetail = async (id: string) => {
    const res = await fetch(`/api/generations/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load generation.');
    return (await res.json()) as {
      toolId: string;
      output: Rec;
      marketplace: string | null;
      source: string;
    };
  };

  const copy = async (item: GenerationSummary) => {
    setBusyId(item.id);
    try {
      const detail = await withDetail(item.id);
      const ok = await copyText(
        buildExportText(detail.toolId, detail.output, {
          marketplace: detail.marketplace ?? undefined,
          source: detail.source,
        })
      );
      toast[ok ? 'success' : 'error'](ok ? 'Copied to clipboard.' : 'Copy failed.');
    } catch {
      toast.error('Could not load this generation.');
    } finally {
      setBusyId(null);
    }
  };

  const save = async (item: GenerationSummary) => {
    setBusyId(item.id);
    try {
      const detail = await withDetail(item.id);
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: detail.toolId,
          title: suggestSavedTitle(detail.toolId, detail.output),
          content: JSON.stringify(detail.output),
          marketplace: detail.marketplace ?? undefined,
          tags: [detail.source],
          generationId: item.id,
        }),
      });
      if (!res.ok) throw new Error();
      setSavedIds((prev) => new Set(prev).add(item.id));
      toast.success('Saved to your library.');
    } catch {
      toast.error('Could not save this generation.');
    } finally {
      setBusyId(null);
    }
  };

  if (!items.length) {
    return (
      <p className="text-sm text-gray-400">
        No generations yet - use the quick panel above or open a tool to get
        started.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((item) => {
        const tool = TOOL_BY_ID[item.toolId as keyof typeof TOOL_BY_ID];
        const busy = busyId === item.id;
        const saved = savedIds.has(item.id);
        return (
          <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {tool?.shortName ?? item.toolId}
                </span>
                {item.marketplace && <span>· {item.marketplace}</span>}
                <span>· {formatDateTime(item.createdAt)}</span>
                <span
                  className={
                    item.source === 'demo'
                      ? 'rounded-full bg-amber-50 px-2 py-0.5 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                      : 'rounded-full bg-primary-50 px-2 py-0.5 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300'
                  }
                >
                  {item.source === 'demo' ? 'demo' : 'claude'}
                </span>
                <span>−{item.credits} credits</span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-700 dark:text-gray-300">
                {item.preview || '-'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => copy(item)}
                disabled={busy}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => save(item)}
                disabled={busy || saved}
                className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 dark:bg-white dark:text-gray-900"
              >
                {saved ? 'Saved ✓' : busy ? '…' : 'Save'}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
