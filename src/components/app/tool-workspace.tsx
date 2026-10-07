'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ResultView from '@/components/app/result-view';
import { ToolIcon } from '@/components/app/tool-icons';
import { CREDITS_CHANGED_EVENT } from '@/components/app/app-shell';
import { copyText, downloadFile, slugify } from '@/lib/export';
import { getMarketplace } from '@/lib/marketplaces';
import { buildBulkCsv, buildExportText, suggestSavedTitle } from '@/lib/output-utils';
import { SAMPLE_PRODUCTS } from '@/lib/sample-products';
import { TOOL_BY_ID, type ToolDefinition } from '@/lib/tools/registry';
import type { ApiErrorPayload, ToolOutput } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GenerationResult {
  generationId: string;
  source: 'claude' | 'demo';
  output: ToolOutput;
  cost: number;
  balance: number;
}

type Rec = Record<string, unknown>;

function defaultValues(tool: ToolDefinition): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of tool.fields) {
    if (f.key === 'marketplace') v[f.key] = 'shopify';
    else if (f.key === 'tone')
      v[f.key] = tool.id === 'support-reply-generator' ? 'empathetic' : 'professional';
    else if (f.key === 'platform') v[f.key] = 'instagram';
    else v[f.key] = '';
  }
  return v;
}

export default function ToolWorkspace({ toolId }: { toolId: string }) {
  const tool = TOOL_BY_ID[toolId as keyof typeof TOOL_BY_ID] as ToolDefinition;
  const searchParams = useSearchParams();

  const [values, setValues] = useState<Record<string, string>>(() =>
    defaultValues(tool)
  );
  const [brandVoices, setBrandVoices] = useState<{ id: string; title: string }[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [draft, setDraft] = useState<Rec | null>(null);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const marketplaceRules = getMarketplace(values.marketplace);

  // Prefill from query params (dashboard quick links, marketplace shortcuts).
  useEffect(() => {
    const product = searchParams.get('product');
    const mp = searchParams.get('marketplace');
    if (!product && !mp) return;
    setValues((prev) => ({
      ...prev,
      ...(product && tool.fields.some((f) => f.key === 'productName')
        ? { productName: product }
        : {}),
      ...(mp && tool.fields.some((f) => f.key === 'marketplace')
        ? { marketplace: mp }
        : {}),
    }));
  }, [searchParams, tool.fields]);

  // Demo mode indicator + saved brand voices for the selector.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/overview', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (active) setDemoMode(Boolean(data.demoMode));
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (tool.id === 'brand-voice-generator') return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          '/api/library?toolId=brand-voice-generator',
          { cache: 'no-store' }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data.items)) {
          setBrandVoices(
            data.items.map((i: { id: string; title: string }) => ({
              id: i.id,
              title: i.title,
            }))
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, [tool.id]);

  const requiredMissing = useMemo(
    () =>
      tool.fields
        .filter((f) => f.required)
        .filter((f) => !(values[f.key] ?? '').trim()),
    [tool.fields, values]
  );

  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const fillSample = (sampleId: string) => {
    const sample = SAMPLE_PRODUCTS.find((s) => s.id === sampleId);
    if (!sample) return;
    setValues((prev) => ({
      ...prev,
      ...(tool.fields.some((f) => f.key === 'productName')
        ? { productName: sample.name }
        : {}),
      ...(tool.fields.some((f) => f.key === 'category')
        ? { category: sample.category }
        : {}),
      ...(tool.fields.some((f) => f.key === 'features')
        ? { features: sample.features }
        : {}),
      ...(tool.fields.some((f) => f.key === 'targetCustomer')
        ? { targetCustomer: sample.targetCustomer }
        : {}),
      ...(tool.fields.some((f) => f.key === 'keywords')
        ? { keywords: sample.keywords }
        : {}),
      ...(tool.id === 'bulk-content-generator'
        ? {
            products: SAMPLE_PRODUCTS.slice(0, 3)
              .map((s) => `${s.name} | ${s.features}`)
              .join('\n'),
          }
        : {}),
    }));
  };

  const generate = async () => {
    if (generating) return;
    if (requiredMissing.length) {
      setError(`Please fill: ${requiredMissing.map((f) => f.label).join(', ')}.`);
      setErrorCode('validation');
      return;
    }
    setGenerating(true);
    setError(null);
    setErrorCode(null);

    const inputs: Record<string, unknown> = {};
    for (const f of tool.fields) {
      const v = (values[f.key] ?? '').trim();
      if (v) inputs[f.key] = v;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId: tool.id, inputs }),
      });
      const data = await res.json();

      if (!res.ok) {
        const payload = data as ApiErrorPayload;
        if (payload?.error?.code === 'unauthorized') {
          toast.error('Please sign in to continue.');
          window.location.href = '/signin';
          return;
        }
        setError(payload?.error?.message ?? 'Generation failed. Please try again.');
        setErrorCode(payload?.error?.code ?? 'internal');
        if (payload?.error?.code === 'rate_limited') {
          toast.error(payload.error.message);
        }
        return;
      }

      const next: GenerationResult = {
        generationId: data.generationId,
        source: data.source,
        output: data.output,
        cost: data.cost,
        balance: data.balance,
      };
      setResult(next);
      setDraft(data.output as Rec);
      setSavedItemId(null);
      window.dispatchEvent(new Event(CREDITS_CHANGED_EVENT));
      toast.success(
        next.source === 'demo'
          ? 'Sample output ready (demo mode).'
          : 'Generated with Claude.'
      );
    } catch {
      setError('Network error - could not reach the generation service.');
      setErrorCode('internal');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    const text = buildExportText(tool.id, draft, {
      marketplace: values.marketplace,
      tone: values.tone,
      source: result?.source,
    });
    const ok = await copyText(text);
    toast[ok ? 'success' : 'error'](ok ? 'Copied to clipboard.' : 'Copy failed.');
  };

  const handleDownload = (kind: 'txt' | 'json' | 'csv') => {
    if (!draft) return;
    const base = slugify(`${tool.shortName}-${values.productName || 'output'}`);
    if (kind === 'txt') {
      downloadFile(
        `${base}.txt`,
        buildExportText(tool.id, draft, {
          marketplace: values.marketplace,
          tone: values.tone,
          source: result?.source,
        })
      );
    } else if (kind === 'json') {
      downloadFile(`${base}.json`, JSON.stringify(draft, null, 2), 'application/json');
    } else {
      downloadFile(`${base}.csv`, buildBulkCsv(draft), 'text/csv');
    }
    toast.success(`Downloaded ${kind.toUpperCase()} file.`);
  };

  const saveToLibrary = async () => {
    if (!draft || !result) return;
    setSaving(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          title: suggestSavedTitle(tool.id, draft, values.productName),
          content: JSON.stringify(draft),
          marketplace: values.marketplace || undefined,
          tags: [result.source],
          generationId: result.generationId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error?.message ?? 'Could not save item.');
        return;
      }
      setSavedItemId(data.item.id);
      toast.success('Saved to your library.');
    } catch {
      toast.error('Could not save item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wrapper py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
            <ToolIcon name={tool.icon} className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {tool.name}
            </h1>
            <p className="mt-0.5 max-w-xl text-sm text-gray-500 dark:text-gray-400">
              {tool.description}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {tool.bulkCostPerItem
            ? `${tool.bulkCostPerItem} credit / product`
            : `${tool.cost} ${tool.cost === 1 ? 'credit' : 'credits'} per run`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* ------------------------------- form ------------------------------- */}
        <div className="h-fit rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
          <div className="mb-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              Try a sample
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PRODUCTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => fillSample(s.id)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {tool.fields.map((field) => {
              const id = `${tool.id}-${field.key}`;
              const value = values[field.key] ?? '';
              return (
                <div key={field.key}>
                  <label
                    htmlFor={id}
                    className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {field.label}
                    {field.required && (
                      <span className="ml-0.5 text-error-500">*</span>
                    )}
                  </label>

                  {field.kind === 'textarea' && (
                    <textarea
                      id={id}
                      value={value}
                      rows={field.rows ?? 3}
                      placeholder={field.placeholder}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="w-full resize-y rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
                    />
                  )}

                  {field.kind === 'text' && (
                    <input
                      id={id}
                      type="text"
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="h-11 w-full rounded-full border border-gray-200 px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
                    />
                  )}

                  {field.kind === 'select' && (
                    <select
                      id={id}
                      value={value}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      className="h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-800 focus:border-primary-300 focus:outline-0 focus:ring-3 focus:ring-primary-300/20 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
                    >
                      {field.key === 'brandVoiceId' ? (
                        <>
                          <option value="">None</option>
                          {brandVoices.map((bv) => (
                            <option key={bv.id} value={bv.id}>
                              {bv.title}
                            </option>
                          ))}
                        </>
                      ) : (
                        (field.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  )}

                  {field.help && (
                    <p className="mt-1 text-xs text-gray-400">{field.help}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={generate}
            disabled={generating}
            className={cn(
              'gradient-btn mt-6 flex h-12 w-full items-center justify-center rounded-full text-sm font-medium text-white transition',
              generating && 'cursor-not-allowed opacity-70'
            )}
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            {demoMode
              ? 'Demo mode: sample output is used. Add ANTHROPIC_API_KEY to run Claude.'
              : 'Powered by Claude · sandboxed server-side'}
          </p>
        </div>

        {/* ------------------------------ result ------------------------------ */}
        <div>
          {error && (
            <div className="mb-4 rounded-2xl border border-error-100 bg-error-50 px-5 py-4 text-sm text-error-600 dark:border-error-500/20 dark:bg-error-500/10">
              <p className="font-medium">{error}</p>
              {errorCode === 'insufficient_credits' && (
                <p className="mt-1 text-xs">
                  Top up in your{' '}
                  <Link href="/dashboard" className="font-semibold underline">
                    dashboard
                  </Link>{' '}
                  or contact {`hello@asiabd.shop`} for more credits.
                </p>
              )}
            </div>
          )}

          {!result || !draft ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 p-10 text-center dark:border-gray-700">
              <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 dark:bg-white/5">
                <ToolIcon name={tool.icon} className="size-6" />
              </span>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Your generated content will appear here
              </p>
              <p className="mt-1 max-w-xs text-xs text-gray-400">
                Fill the form - or load a sample product - and hit Generate.
                Everything stays editable before you save or export.
              </p>
            </div>
          ) : (
            <div
              key={result.generationId}
              className="anim-swap-3d rounded-3xl border border-gray-100 bg-gray-50/60 p-6 dark:border-gray-800 dark:bg-white/[0.02]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 font-medium',
                      result.source === 'demo'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                        : 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300'
                    )}
                  >
                    {result.source === 'demo' ? 'Demo - sample output' : 'Claude'}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                    {marketplaceRules.label}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-gray-500 dark:bg-white/5 dark:text-gray-400">
                    −{result.cost} credit{result.cost === 1 ? '' : 's'} · {result.balance} left
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('txt')}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                  >
                    .txt
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('json')}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                  >
                    .json
                  </button>
                  {tool.id === 'bulk-content-generator' && (
                    <button
                      type="button"
                      onClick={() => handleDownload('csv')}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
                    >
                      .csv
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={generate}
                    disabled={generating}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary-300 hover:text-primary-500 disabled:opacity-60 dark:border-gray-700 dark:text-gray-300"
                  >
                    Regenerate
                  </button>
                  {savedItemId ? (
                    <Link
                      href="/library"
                      className="rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-gray-900"
                    >
                      Saved ✓ - View in library
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={saveToLibrary}
                      disabled={saving}
                      className="rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-medium text-white disabled:opacity-60 dark:bg-white dark:text-gray-900"
                    >
                      {saving ? 'Saving…' : 'Save to library'}
                    </button>
                  )}
                </div>
              </div>

              <p className="mb-4 text-xs text-gray-400">
                All fields are editable - tweak anything before saving or exporting.
              </p>

              <ResultView
                toolId={tool.id}
                value={draft}
                onChange={setDraft}
                marketplaceId={values.marketplace}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
