export default function AppPreviewMock() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-theme-lg dark:border-white/10 dark:bg-dark-secondary">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5 dark:border-gray-800">
        <span className="size-3 rounded-full bg-[#FF5F57]" />
        <span className="size-3 rounded-full bg-[#FEBC2E]" />
        <span className="size-3 rounded-full bg-[#28C840]" />
        <span className="ml-4 hidden rounded-full bg-gray-100 px-4 py-1 text-xs text-gray-400 sm:block dark:bg-white/5">
          asiabd.shop/tools/product-title-generator
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[340px_1fr]">
        {/* form side */}
        <div className="border-b border-gray-100 p-6 md:border-b-0 md:border-r dark:border-gray-800">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Product details
          </p>
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                Product name
              </p>
              <div className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
                AeroStride Everyday Running Shoes
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Marketplace
                </p>
                <div className="flex items-center justify-between rounded-full border border-primary-300 bg-primary-50/50 px-4 py-2 text-sm text-gray-700 dark:border-primary-500/40 dark:bg-primary-500/10 dark:text-gray-200">
                  Shopify
                  <span className="text-primary-400">▾</span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Tone
                </p>
                <div className="flex items-center justify-between rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-200">
                  Professional
                  <span className="text-gray-400">▾</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 px-4 py-3 text-xs leading-5 text-gray-400 dark:border-gray-700">
              Breathable knit upper, memory-foam insole, anti-slip outsole…
            </div>
          </div>
          <div className="gradient-btn mt-5 flex h-10 items-center justify-center rounded-full text-sm font-medium text-white">
            Generate
          </div>
        </div>

        {/* result side */}
        <div className="bg-gray-50/60 p-6 dark:bg-white/[0.02]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Generated titles
            </p>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              Claude · 3 options
            </span>
          </div>
          <div className="space-y-3">
            {[
              { text: 'AeroStride Running Shoes - Breathable Knit Upper', count: 51 },
              { text: 'Running Shoes: AeroStride with Memory-Foam Insole', count: 52 },
              { text: 'AeroStride Everyday Running Shoes, Anti-Slip Outsole', count: 56 },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-dark-primary"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {t.text}
                </p>
                <p className="mt-1 text-xs text-gray-400">{t.count}/70 characters</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
            <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
              Copy
            </span>
            <span className="rounded-full border border-gray-200 px-3 py-1 dark:border-gray-700">
              Export
            </span>
            <span className="rounded-full bg-gray-900 px-3 py-1 text-white dark:bg-white dark:text-gray-900">
              Save
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
