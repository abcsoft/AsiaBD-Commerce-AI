'use client';

import CountUp from '@/components/motion/count-up';
import Reveal from '@/components/motion/reveal';

const STATS = [
  { value: 50, label: 'welcome credits on every new account' },
  { value: 9, label: 'focused AI tools, one workflow' },
  { value: 5, label: 'marketplaces covered out of the box' },
  { value: 3, label: 'export formats: TXT, JSON, CSV' },
];

export default function StatsBand() {
  return (
    <section className="border-b border-gray-100 bg-white py-12 dark:border-gray-800 dark:bg-dark-primary md:py-16">
      <div className="wrapper">
        <div className="mx-auto grid max-w-[1080px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.07} className="text-center">
              <CountUp
                value={stat.value}
                className="text-4xl font-bold tracking-tight text-gray-800 tabular-nums dark:text-white/90 md:text-5xl"
              />
              <p className="mx-auto mt-2 max-w-[190px] text-sm leading-5 text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
