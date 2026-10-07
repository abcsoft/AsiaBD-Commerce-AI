import type { Metadata } from 'next';
import Link from 'next/link';
import QuickGenerate from '@/components/app/quick-generate';
import RecentGenerations from '@/components/app/recent-generations';
import { requireUser } from '@/lib/auth';
import { getOverview } from '@/lib/db';
import { MARKETPLACES } from '@/lib/marketplaces';
import { TOOL_BY_ID } from '@/lib/tools/registry';
import { pluralize } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const user = await requireUser();
  const data = getOverview(user.id);

  const maxToolCount = Math.max(1, ...data.topTools.map((t) => t.count));

  return (
    <div className="wrapper py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your generation activity, credits, and shortcuts - all in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Credits + ledger */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Credit balance
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-800 dark:text-white/90">
            {data.credits}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Credits are deducted per generation. Failed runs are never charged.
          </p>
          <div className="mt-5 space-y-2.5">
            {data.ledger.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate pr-3 text-gray-500 dark:text-gray-400">
                  {entry.reason ?? entry.type}
                  {entry.toolId && TOOL_BY_ID[entry.toolId as keyof typeof TOOL_BY_ID]
                    ? ` · ${TOOL_BY_ID[entry.toolId as keyof typeof TOOL_BY_ID].shortName}`
                    : ''}
                </span>
                <span
                  className={
                    entry.type === 'usage'
                      ? 'shrink-0 font-medium text-gray-800 dark:text-white/90'
                      : 'shrink-0 font-medium text-success-600'
                  }
                >
                  {entry.type === 'usage' ? '−' : '+'}
                  {entry.amount}
                </span>
              </div>
            ))}
            {data.ledger.length === 0 && (
              <p className="text-sm text-gray-400">No credit activity yet.</p>
            )}
          </div>
        </div>

        {/* Quick generate */}
        <div className="lg:col-span-2">
          <QuickGenerate />
        </div>

        {/* Top tools */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Top tools
          </p>
          <div className="mt-4 space-y-3">
            {data.topTools.length === 0 && (
              <p className="text-sm text-gray-400">
                Generate something to see your most-used tools.
              </p>
            )}
            {data.topTools.map((stat) => {
              const tool = TOOL_BY_ID[stat.toolId as keyof typeof TOOL_BY_ID];
              return (
                <div key={stat.toolId}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate pr-2 text-gray-600 dark:text-gray-300">
                      {tool?.shortName ?? stat.toolId}
                    </span>
                    <span className="text-gray-400">{stat.count}×</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-white/5">
                    <div
                      className="h-2 rounded-full bg-primary-500"
                      style={{ width: `${(stat.count / maxToolCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved outputs */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Saved outputs
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {data.savedCount}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {pluralize(data.savedCount, 'item')} in your content library.
          </p>
          <Link
            href="/library"
            className="mt-4 inline-flex rounded-full bg-gray-900 px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-gray-900"
          >
            Open library
          </Link>
        </div>

        {/* Marketplace shortcuts */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Marketplace shortcuts
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Jump straight into a title generation tuned for your marketplace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MARKETPLACES.map((m) => (
              <Link
                key={m.id}
                href={`/tools/product-title-generator?marketplace=${m.id}`}
                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
              >
                {m.label} titles
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent generations */}
      <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-dark-primary">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Recent generations
          </p>
          <Link href="/tools" className="text-xs font-medium text-primary-500">
            New generation →
          </Link>
        </div>
        <RecentGenerations items={data.generations} />
      </div>
    </div>
  );
}
