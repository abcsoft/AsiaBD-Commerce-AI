import type { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/motion/reveal';
import { ToolIcon } from '@/components/app/tool-icons';
import { requireUser } from '@/lib/auth';
import { TOOLS } from '@/lib/tools/registry';

export const metadata: Metadata = {
  title: 'AI Tools for E-commerce Sellers',
  description:
    'Nine AI tools built for e-commerce sellers - titles, SEO descriptions, listing optimization, ads, social captions, support replies, brand voice, keywords, and bulk generation.',
};

const CATEGORY_LABELS = {
  content: 'Content',
  marketplace: 'Marketplace',
  growth: 'Growth',
  scale: 'Scale',
} as const;

export default async function ToolsPage() {
  await requireUser();
  return (
    <div className="wrapper py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Your AI content toolkit
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Everything a marketplace seller needs to write, optimize, and scale
          product content - tuned per marketplace and per brand voice.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool, i) => (
          <Reveal
            key={tool.id}
            delay={Math.min(i * 0.05, 0.35)}
            className="h-full"
          >
            <Link
              href={`/tools/${tool.id}`}
              className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-theme-md dark:border-gray-800 dark:bg-dark-primary"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-500/10">
                  <ToolIcon name={tool.icon} className="size-6" />
                </span>
                <span className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  {CATEGORY_LABELS[tool.category]}
                </span>
              </div>
              <h2 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 dark:text-white/90">
                {tool.name}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {tool.description}
              </p>
              <p className="mt-4 text-xs font-medium text-gray-400">
                {tool.bulkCostPerItem
                  ? `${tool.bulkCostPerItem} credit / product`
                  : `${tool.cost} ${tool.cost === 1 ? 'credit' : 'credits'} per run`}
              </p>
            </Link>
          </Reveal>
        ))}

        <Reveal delay={0.4} className="h-full">
          <Link
            href="/library"
            className="group flex h-full flex-col rounded-3xl border border-dashed border-gray-200 bg-transparent p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-300 dark:border-gray-700"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-300">
                <ToolIcon name="library" className="size-6" />
              </span>
            </div>
            <h2 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 dark:text-white/90">
              Saved Content Library
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Every saved output in one place - search, edit, export, and reuse
              your best-performing copy.
            </p>
            <p className="mt-4 text-xs font-medium text-gray-400">
              Always free
            </p>
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
