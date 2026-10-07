import Link from 'next/link';
import Reveal from '@/components/motion/reveal';

const PERSONAS = [
  {
    icon: 'title' as const,
    title: 'Shopify store owners',
    body: 'Keep a consistent brand voice across every product page and collection - without hiring a copy team.',
    tools: ['Titles', 'SEO descriptions', 'Brand voice'],
  },
  {
    icon: 'optimize' as const,
    title: 'Amazon FBA sellers',
    body: 'Fix listings that under-convert: keyword-front-loaded titles, five strong bullets, and scannable descriptions.',
    tools: ['Listing optimizer', 'Keywords', 'Ad copy'],
  },
  {
    icon: 'voice' as const,
    title: 'Etsy makers',
    body: 'Speak the language Etsy shoppers search with - occasion, material, and gift-intent phrases built in.',
    tools: ['Titles', 'Tags', 'Social captions'],
  },
  {
    icon: 'social' as const,
    title: 'TikTok Shop creators',
    body: 'Move fast: punchy titles, energetic descriptions, and captions that match creator-style selling.',
    tools: ['Titles', 'Bulk content', 'Captions'],
  },
];

export default function UseCases() {
  return (
    <section className="py-14 md:py-24 dark:bg-dark-primary">
      <div className="wrapper">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            Built for your kind of store
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Whether you sell on one marketplace or five, the toolkit adapts to
            how you sell.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PERSONAS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="h-full">
              <div className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-theme-md dark:border-gray-800 dark:bg-dark-primary">
              <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
                {p.title}
              </h3>
              <p className="flex-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {p.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tools.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-gray-900 px-7 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Try it with sample products
          </Link>
        </div>
      </div>
    </section>
  );
}
