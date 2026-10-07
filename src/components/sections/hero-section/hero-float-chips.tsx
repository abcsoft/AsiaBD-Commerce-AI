import { ToolIcon } from '@/components/app/tool-icons';

/**
 * Decorative depth layer around the hero product preview.
 * Pure CSS motion; floats gently, enters staggered, and never intercepts
 * pointers. Hidden below lg.
 */
export default function HeroFloatChips() {
  const chips = [
    {
      icon: 'title',
      title: 'Amazon title',
      body: '51/70 - fits the limit',
      className: '-left-6 top-24',
      delay: '1050ms',
      float: 'anim-float-a',
    },
    {
      icon: 'keyword',
      title: 'Etsy tags',
      body: '13/13 ready',
      className: '-right-8 top-44',
      delay: '1200ms',
      float: 'anim-float-b',
    },
    {
      icon: 'library',
      title: 'Draft saved',
      body: '-1 credit, 49 left',
      className: '-left-4 bottom-24',
      delay: '1350ms',
      float: 'anim-float-c',
    },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 hidden xl:block"
      aria-hidden="true"
    >
      {chips.map((chip) => (
        <div
          key={chip.title}
          className={`anim-chip-in absolute ${chip.className}`}
          style={{ animationDelay: chip.delay }}
        >
          <div className={chip.float}>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white/95 px-4 py-3 shadow-theme-md backdrop-blur-sm dark:border-gray-700 dark:bg-dark-primary/95">
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
                <ToolIcon name={chip.icon} className="size-4" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-gray-800 dark:text-white/90">
                  {chip.title}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                  {chip.body}
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
