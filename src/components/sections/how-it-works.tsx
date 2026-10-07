import Reveal from '@/components/motion/reveal';

const STEPS = [
  {
    number: '01',
    title: 'Describe your product',
    body: 'Name, category, features, target customer, or load a sample and go. It takes under a minute.',
  },
  {
    number: '02',
    title: 'Pick the marketplace & tone',
    body: 'Shopify, Amazon, Etsy, TikTok Shop, or general e-commerce. Set the tone, and apply a saved brand voice.',
  },
  {
    number: '03',
    title: 'Generate with Claude',
    body: 'Claude writes structured, marketplace-aware copy. Three title options, bullets, SEO fields, and more.',
  },
  {
    number: '04',
    title: 'Edit, save, export',
    body: 'Tweak inline, save to your library, copy or download as TXT, JSON, or CSV. Credits are only charged on success.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gray-50 py-14 md:py-24 dark:bg-[#101828]"
    >
      <div className="wrapper">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            From product details to publish-ready content
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            A clean, four-step workflow built for sellers who publish across
            multiple marketplaces.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.09} className="h-full">
              <div className="group h-full rounded-3xl border border-gray-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-theme-md dark:border-gray-800 dark:bg-dark-primary dark:hover:border-primary-500/40">
                <span className="step-badge mb-4 inline-flex size-10 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-theme-xs transition-transform duration-300 group-hover:scale-110">
                  {step.number}
                </span>
                <h3 className="mb-2 text-base font-semibold text-gray-800 dark:text-white/90">
                  {step.title}
                </h3>
                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          Every run happens server-side. Your API keys never touch the browser,
          and failed generations are never charged.
        </p>
      </div>
    </section>
  );
}
