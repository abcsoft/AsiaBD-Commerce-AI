import Link from 'next/link';
import Reveal from '@/components/motion/reveal';
import { ToolIcon } from '@/components/app/tool-icons';
import { TOOLS } from '@/lib/tools/registry';

export default function ToolsGrid() {
  return (
    <section className="bg-gray-50 py-14 md:py-24 dark:bg-[#101828]">
      <div className="wrapper">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            The complete seller toolkit
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Nine focused AI tools plus a saved content library - everything you
            need to write and scale product content.
          </p>
        </div>

        <div className="mx-auto grid max-w-[1080px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 transition-transform duration-300 group-hover:scale-110 dark:bg-primary-500/10">
                <ToolIcon name={tool.icon} className="size-6" />
              </span>
              <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 dark:text-white/90">
                {tool.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {tool.description}
              </p>
            </Link>
            </Reveal>
          ))}

          <Reveal delay={0.4} className="h-full">
            <Link
              href="/library"
              className="group flex h-full flex-col rounded-3xl border border-dashed border-gray-200 bg-transparent p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-300 dark:border-gray-700"
            >
            <span className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 dark:bg-white/5 dark:text-gray-300">
              <ToolIcon name="library" className="size-6" />
            </span>
            <h3 className="text-base font-semibold text-gray-800 group-hover:text-primary-600 dark:text-white/90">
              Saved Content Library
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Every saved output in one searchable place - edit, export, and
              reuse your best copy.
            </p>
            </Link>
          </Reveal>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/tools"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 px-7 text-sm font-medium text-gray-600 transition hover:border-primary-300 hover:text-primary-500 dark:border-gray-700 dark:text-gray-300"
          >
            Browse all tools
          </Link>
        </div>
      </div>
    </section>
  );
}
