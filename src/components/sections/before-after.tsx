'use client';

import { useState } from 'react';
import { CheckIcon, XIcon } from '@/icons/icons';
import { cn } from '@/lib/utils';

interface Example {
  id: string;
  label: string;
  before: { title: string; points: string[] };
  after: { title: string; points: string[] };
}

const EXAMPLES: Example[] = [
  {
    id: 'amazon',
    label: 'Amazon',
    before: {
      title: 'Running shoes for men new arrival comfortable size 8-11',
      points: [
        'No brand or model name in the title',
        'Keyword stuffed, reads awkwardly',
        'No benefit-led bullets - just a spec dump',
      ],
    },
    after: {
      title:
        'AeroStride Everyday Running Shoes - Breathable Knit, Memory-Foam Insole, Anti-Slip Outsole',
      points: [
        'Brand + model + top attributes, front-loaded keywords',
        '5 benefit-led bullets within Amazon style rules',
        'A+ friendly description with no unsupported claims',
      ],
    },
  },
  {
    id: 'etsy',
    label: 'Etsy',
    before: {
      title: 'Ceramic vase set of 3',
      points: [
        'No occasion, style, or buyer language',
        'Zero long-tail phrases buyers actually search',
        'Flat description with no story',
      ],
    },
    after: {
      title:
        'TerraNest Ceramic Vase Set of 3 | Minimalist Earth-Tone Home Decor | Housewarming Gift',
      points: [
        'Front-loaded buyer phrases + gift intent',
        '13 focused tags mapped to long-tail searches',
        'Warm, material-led description buyers trust',
      ],
    },
  },
  {
    id: 'shopify',
    label: 'Shopify',
    before: {
      title: 'Vitamin C Serum - best serum ever!!',
      points: [
        'Exaggerated claims - hurts trust and ads',
        'SEO title over length, truncated in Google',
        'No structured features or sizing info',
      ],
    },
    after: {
      title: 'GlowDrop Vitamin C Serum | Brightening Daily Serum with Hyaluronic Acid',
      points: [
        'SEO title within Google’s window + clean meta',
        'Benefit-first paragraphs and feature list',
        'Claims kept accurate and specific',
      ],
    },
  },
];

export default function BeforeAfter() {
  const [activeId, setActiveId] = useState(EXAMPLES[0].id);
  const example = EXAMPLES.find((e) => e.id === activeId) ?? EXAMPLES[0];

  return (
    <section className="py-14 md:py-24 dark:bg-dark-primary">
      <div className="wrapper">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            Weak listings → listings that convert
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Real examples of the transformation, per marketplace.
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="flex gap-1 rounded-full bg-gray-100 p-1 dark:bg-white/5">
            {EXAMPLES.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setActiveId(e.id)}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium text-gray-500 transition',
                  activeId === e.id &&
                    'bg-white text-gray-800 shadow-theme-xs dark:bg-white/10 dark:text-white/90'
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <div key={activeId} className="anim-swap-3d mx-auto grid max-w-[1000px] gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-theme-sm dark:border-gray-700 dark:bg-dark-primary">
            <span className="mb-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500 dark:bg-white/5 dark:text-gray-400">
              Before
            </span>
            <p className="text-base font-medium text-gray-600 dark:text-gray-300">
              {example.before.title}
            </p>
            <ul className="mt-4 space-y-2">
              {example.before.points.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <XIcon className="mt-0.5 size-4 shrink-0 text-error-500" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border-2 border-primary-200 bg-white p-6 shadow-theme-sm transition duration-300 hover:-translate-y-1 hover:shadow-theme-md dark:border-primary-500/40 dark:bg-dark-primary">
            <span className="mb-4 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              After - AsiaBD Commerce AI
            </span>
            <p className="text-base font-medium text-gray-800 dark:text-white/90">
              {example.after.title}
            </p>
            <ul className="mt-4 space-y-2">
              {example.after.points.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="mt-0.5 shrink-0 text-success-600">
                    <CheckIcon />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
