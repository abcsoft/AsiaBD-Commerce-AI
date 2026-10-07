'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckIcon } from '@/icons/icons';
import Reveal from '@/components/motion/reveal';
import { MARKETPLACES } from '@/lib/marketplaces';
import { SAMPLE_PRODUCTS } from '@/lib/sample-products';
import { buildShowcase } from '@/lib/showcase';
import { cn } from '@/lib/utils';

export default function GeneratorPreview() {
  const [sampleId, setSampleId] = useState(SAMPLE_PRODUCTS[0].id);
  const [marketplaceId, setMarketplaceId] = useState('shopify');

  const sample = SAMPLE_PRODUCTS.find((s) => s.id === sampleId) ?? SAMPLE_PRODUCTS[0];
  const showcase = useMemo(
    () => buildShowcase(sample, marketplaceId),
    [sample, marketplaceId]
  );

  return (
    <section id="preview" className="py-14 md:py-24 dark:bg-dark-primary">
      <div className="wrapper">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            See it in action, right here
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Pick a sample product and a marketplace. This is a live preview with
            sample data; in the app, Claude writes this for your real products.
          </p>
        </Reveal>

        <div className="mx-auto max-w-[900px]">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-gray-100 p-1 dark:bg-white/5">
              {SAMPLE_PRODUCTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSampleId(s.id)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 transition',
                    sampleId === s.id &&
                      'bg-white text-gray-800 shadow-theme-xs dark:bg-white/10 dark:text-white/90'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <select
              value={marketplaceId}
              onChange={(e) => setMarketplaceId(e.target.value)}
              className="h-10 rounded-full border border-gray-200 bg-white px-4 text-xs font-medium text-gray-700 focus:border-primary-300 focus:outline-0 dark:border-gray-700 dark:bg-dark-secondary dark:text-white/90"
              aria-label="Select marketplace"
            >
              {MARKETPLACES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gradient-to-b from-gray-50 to-white p-6 shadow-theme-sm dark:border-gray-800 dark:from-white/[0.03] dark:to-transparent">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {sample.name}
              </p>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                Preview · sample data
              </span>
            </div>

            <div key={`${sampleId}-${marketplaceId}`} className="anim-swap-3d">
              <div className="grid gap-4 md:grid-cols-3">
              {showcase.titles.map((title, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary"
                >
                  <p className="text-sm font-medium leading-6 text-gray-800 dark:text-white/90">
                    {title}
                  </p>
                  <p className="mt-2 text-[11px] tabular-nums text-gray-400">
                    {title.length}/{showcase.titleLimit} characters ·{' '}
                    {showcase.marketplaceLabel}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Highlight bullets
                </p>
                <ul className="space-y-1.5">
                  {showcase.bullets.map((b, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <span className="mt-0.5 shrink-0 text-primary-500">
                        <CheckIcon />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Meta description
                </p>
                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {showcase.metaDescription}
                </p>
              </div>
            </div>
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-gray-400">
                In the app: use your real products, edit results, save to your
                library, and export anywhere.
              </p>
              <Link
                href="/signup"
                className="gradient-btn inline-flex h-11 shrink-0 items-center justify-center rounded-full px-6 text-sm font-medium text-white"
              >
                Create yours free →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
