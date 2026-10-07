import { MARKETPLACES } from '@/lib/marketplaces';

const CHIPS = [
  ...MARKETPLACES.filter((m) => m.id !== 'general').map((m) => ({
    key: m.id,
    label: m.label,
  })),
  { key: 'own-store', label: 'Your own store' },
];

export default function MarketplaceStrip() {
  return (
    <div className="wrapper">
      <div className="relative z-30 mx-auto max-w-[1016px] pb-16 pt-14">
        <p className="text-center text-lg font-medium text-white/60">
          Optimized for every marketplace you sell on
        </p>
        <div className="marquee mt-8 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="marquee-track">
            {[false, true].map((duplicate) => (
              <div
                key={String(duplicate)}
                aria-hidden={duplicate || undefined}
                className={`flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4 ${
                  duplicate ? 'marquee-duplicate' : ''
                }`}
              >
                {CHIPS.map((chip) => (
                  <span
                    key={chip.key}
                    className="whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold tracking-wide text-white/90 backdrop-blur-sm"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
