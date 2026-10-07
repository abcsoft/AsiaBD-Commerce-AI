'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ResultView from '@/components/app/result-view';
import { ToolIcon } from '@/components/app/tool-icons';
import { copyText, downloadFile, slugify } from '@/lib/export';
import { MARKETPLACES } from '@/lib/marketplaces';
import { buildExportText } from '@/lib/output-utils';
import { TOOLS, TOOL_BY_ID } from '@/lib/tools/registry';
import type { SavedItem } from '@/lib/types';
import { cn, formatDateTime } from '@/lib/utils';

type Rec = Record<string, unknown>;

function parseObject(content: string): Rec | null {
  try {
    const v = JSON.parse(content);
    if (v && typeof v === 'object' && !Array.isArray(v)) return v as Rec;
    return null;
  } catch {
    return null;
  }
}

export default function LibraryBrowser() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [toolFilter, setToolFilter] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (toolFilter) params.set('toolId', toolFilter);
      if (marketplaceFilter) params.set('marketplace', marketplaceFilter);
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/library?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.status === 401) {
        window.location.href = '/signin';
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? 'load failed');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      toast.error('Could not load your library.');
    } finally {
      setLoading(false);
    }
  }, [toolFilter, marketplaceFilter, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const expanded = items.find((i) => i.id === expandedId) ?? null;
  const expandedParsed = useMemo(
    () => (expanded ? parseObject(draftContent) : null),
    [expanded, draftContent]
  );

  const openItem = (item: SavedItem) => {
    setExpandedId(item.id);
    setDraftTitle(item.title);
    setDraftContent(item.content);
  };

  const saveChanges = async () => {
    if (!expanded) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/library/${expanded.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle, content: draftContent }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? 'Could not save changes.');
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === expanded.id ? (data.item as SavedItem) : i))
      );
      toast.success('Changes saved.');
    } catch {
      toast.error('Could not save changes.');
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (item: SavedItem) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/library/${item.id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast.error('Could not delete item.');
        return;
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (expandedId === item.id) setExpandedId(null);
      toast.success('Item deleted.');
    } finally {
      setBusy(false);
    }
  };

  const copyItem = async (item: { content: string; toolId: string; marketplace: string | null }) => {
    const parsed = parseObject(item.content);
    const text = parsed
      ? buildExportText(item.toolId, parsed, {
          marketplace: item.marketplace ?? undefined,
        })
      : item.content;
    const ok = await copyText(text);
    toast[ok ? 'success' : 'error'](ok ? 'Copied to clipboard.' : 'Copy failed.');
  };

  const downloadItem = (item: { content: string; toolId: string; title: string; marketplace: string | null }) => {
    const parsed = parseObject(item.content);
    const base = slugify(item.title);
    if (parsed) {
      downloadFile(
        `${base}.txt`,
        buildExportText(item.toolId, parsed, {
          marketplace: item.marketplace ?? undefined,
        })
      );
    } else {
      downloadFile(`${base}.txt`, item.content);
    }
    toast.success('Download started.');
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_200px_200px]">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles and content…"
            className="h-11 w-full rounded-full border border-gray-200 px-5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
          />
        </label>
        <select
          value={toolFilter}
          onChange={(e) => setToolFilter(e.target.value)}
          className="h-11 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-primary-300 focus:outline-0 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
        >
          <option value="">All tools</option>
          {TOOLS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.shortName}
            </option>
          ))}
        </select>
        <select
          value={marketplaceFilter}
          onChange={(e) => setMarketplaceFilter(e.target.value)}
          className="h-11 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-700 focus:border-primary-300 focus:outline-0 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
        >
          <option value="">All marketplaces</option>
          {MARKETPLACES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {loading && items.length === 0 && (
        <p className="text-sm text-gray-400">Loading your library…</p>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-700">
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-white/5">
            <ToolIcon name="library" className="size-6" />
          </span>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Nothing saved yet
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Generate content and hit “Save to library” - it will show up here.
          </p>
          <Link
            href="/tools"
            className="mt-5 rounded-full bg-gray-900 px-5 py-2 text-xs font-medium text-white dark:bg-white dark:text-gray-900"
          >
            Browse tools
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const tool = TOOL_BY_ID[item.toolId as keyof typeof TOOL_BY_ID];
            const isOpen = expandedId === item.id;
            return (
              <li
                key={item.id}
                className={cn(
                  'rounded-3xl border bg-white p-5 dark:bg-dark-primary',
                  isOpen
                    ? 'border-primary-200 shadow-theme-sm lg:col-span-2 dark:border-primary-500/40'
                    : 'border-gray-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-theme-xs dark:border-gray-800'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                      <ToolIcon name={tool?.icon ?? 'spark'} className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                        {item.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>{tool?.shortName ?? item.toolId}</span>
                        {item.marketplace && <span>· {item.marketplace}</span>}
                        <span>· updated {formatDateTime(item.updatedAt)}</span>
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-gray-50 px-2 py-0.5 text-gray-400 dark:bg-white/5"
                          >
                            {t}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!isOpen && (
                      <>
                        <button
                          type="button"
                          onClick={() => copyItem(item)}
                          className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => openItem(item)}
                          className="rounded-full bg-gray-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-gray-900"
                        >
                          Open
                        </button>
                      </>
                    )}
                    {isOpen && (
                      <button
                        type="button"
                        onClick={() => setExpandedId(null)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
                    <label className="mb-4 block">
                      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Title
                      </span>
                      <input
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        className="h-10 w-full rounded-full border border-gray-200 px-4 text-sm text-gray-800 focus:border-primary-300 focus:outline-0 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
                      />
                    </label>

                    {expandedParsed ? (
                      <ResultView
                        toolId={item.toolId}
                        value={expandedParsed}
                        onChange={(next) => setDraftContent(JSON.stringify(next))}
                        marketplaceId={item.marketplace}
                      />
                    ) : (
                      <textarea
                        value={draftContent}
                        onChange={(e) => setDraftContent(e.target.value)}
                        rows={8}
                        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:border-primary-300 focus:outline-0 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
                      />
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={saveChanges}
                        disabled={busy}
                        className="rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
                      >
                        {busy ? 'Saving…' : 'Save changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyItem(item)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadItem(item)}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item)}
                        disabled={busy}
                        className="rounded-full border border-error-100 px-3 py-1.5 text-xs text-error-600 hover:bg-error-50 disabled:opacity-60 dark:border-error-500/20 dark:hover:bg-error-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
