'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { CREDITS_CHANGED_EVENT } from '@/components/app/app-shell';
import ResultView from '@/components/app/result-view';
import { ToolIcon } from '@/components/app/tool-icons';
import { copyText } from '@/lib/export';
import { MARKETPLACES } from '@/lib/marketplaces';
import { buildExportText, suggestSavedTitle } from '@/lib/output-utils';
import { SAMPLE_PRODUCTS } from '@/lib/sample-products';
import { TOOLS } from '@/lib/tools/registry';
import { cn } from '@/lib/utils';

type Rec = Record<string, unknown>;

const QUICK_TOOLS = TOOLS.filter(
  (t) => t.id !== 'bulk-content-generator' && t.id !== 'support-reply-generator'
);

interface QuickResult {
  toolId: string;
  source: string;
  output: Rec;
  cost: number;
  balance: number;
}

export default function QuickGenerate() {
  const [toolId, setToolId] = useState('product-title-generator');
  const [productName, setProductName] = useState('');
  const [marketplace, setMarketplace] = useState('shopify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const run = async () => {
    if (loading) return;
    if (productName.trim().length < 2) {
      setError('Add a product name first (or pick a sample below).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          inputs: { productName: productName.trim(), marketplace },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error?.code === 'unauthorized') {
          toast.error('Please sign in to continue.');
          window.location.href = '/signin';
          return;
        }
        setError(data?.error?.message ?? 'Generation failed.');
        return;
      }
      setResult({
        toolId,
        source: data.source,
        output: data.output as Rec,
        cost: data.cost,
        balance: data.balance,
      });
      setSaved(false);
      window.dispatchEvent(new Event(CREDITS_CHANGED_EVENT));
      toast.success(
        data.source === 'demo' ? 'Sample output ready.' : 'Generated with Claude.'
      );
    } catch {
      setError('Network error - could not generate.');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: result.toolId,
          title: suggestSavedTitle(result.toolId, result.output, productName),
          content: JSON.stringify(result.output),
          marketplace,
          tags: [result.source],
        }),
      });
      if (!res.ok) {
        toast.error('Could not save item.');
        return;
      }
      setSaved(true);
      toast.success('Saved to your library.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Quick generate
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
          <ToolIcon name="spark" className="size-3.5" />
          Runs in one click
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Tool
          </span>
          <select
            value={toolId}
            onChange={(e) => setToolId(e.target.value)}
            className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
          >
            {QUICK_TOOLS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Product name
          </span>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Wireless Earbuds"
            className="h-10 w-full rounded-full border border-gray-200 px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Marketplace
          </span>
          <select
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            className="h-10 w-full rounded-full border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
          >
            {MARKETPLACES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400">Samples:</span>
        {SAMPLE_PRODUCTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setProductName(s.name)}
            className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-400"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className={cn(
            'gradient-btn inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition',
            loading && 'cursor-not-allowed opacity-70'
          )}
        >
          {loading ? 'Generating…' : 'Generate'}
        </button>
        {error && <p className="text-xs text-error-600">{error}</p>}
      </div>

      {result && (
        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="rounded-full bg-white px-2.5 py-1 text-gray-500 dark:bg-white/5 dark:text-gray-400">
              {result.source === 'demo' ? 'Demo - sample output' : 'Claude'} · −
              {result.cost} credits · {result.balance} left
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  const ok = await copyText(
                    buildExportText(result.toolId, result.output, { marketplace })
                  );
                  toast[ok ? 'success' : 'error'](ok ? 'Copied.' : 'Copy failed.');
                }}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
              >
                Copy
              </button>
              {saved ? (
                <Link
                  href="/library"
                  className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-gray-900"
                >
                  Saved ✓
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              )}
              <Link
                href={`/tools/${result.toolId}`}
                className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
              >
                Open in tool →
              </Link>
            </div>
          </div>
          <div className="max-h-96 overflow-auto pr-1">
            <ResultView
              toolId={result.toolId}
              value={result.output}
              compact
              marketplaceId={marketplace}
            />
          </div>
        </div>
      )}
    </div>
  );
}
