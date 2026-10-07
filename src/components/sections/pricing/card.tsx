import { CheckIcon } from '@/icons/icons';
import GlowGradient from '@/assets/pricing/glow';
import type { TBILLING_PLAN } from '@/components/sections/pricing/data';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

type Props = {
  plan: TBILLING_PLAN;
  billingPeriod: keyof TBILLING_PLAN['pricing'];
};

export function PricingCard({ plan, billingPeriod }: Props) {
  const isStarter = plan.name === 'Starter';
  const isContact = plan.ctaHref === '/contact';

  return (
    <div className="relative">
      <div
        className={`relative z-10 h-full rounded-[20px] bg-white shadow-one transition-transform duration-300 hover:-translate-y-1 dark:bg-dark-primary ${
          plan.popular ? 'popular-frame' : ''
        }`}
      >
        <div className="p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-400">
              {plan.name}
            </h2>
            {plan.popular && (
              <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-500 dark:bg-primary-500/15 dark:text-primary-300">
                Popular
              </span>
            )}
          </div>
          <p className="mt-4 flex items-baseline">
            <span className="text-4xl font-semibold text-gray-800 dark:text-white/90">
              {plan.pricing[billingPeriod].formattedPrice}
            </span>

            {!!plan.pricing[billingPeriod].amount && (
              <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                {billingPeriod === 'yearly' ? 'Per year' : 'Per month'}
              </span>
            )}
          </p>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {plan.description}
          </p>

          {isContact ? (
            <ContactSalesLink>{plan.cta}</ContactSalesLink>
          ) : (
            <Link
              href={plan.ctaHref}
              className={cn(
                'mt-7 block w-full rounded-full px-8 py-3.5 text-center text-sm font-medium transition',
                {
                  'gradient-btn btn-shine text-white': plan.popular,
                  'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-800 dark:bg-dark-primary dark:text-white/90 dark:hover:bg-gray-800':
                    !plan.popular && isStarter,
                  'bg-gray-700 text-white hover:bg-gray-900 dark:bg-white/[0.03] dark:hover:bg-primary-500':
                    !plan.popular && !isStarter,
                }
              )}
            >
              {plan.cta}
            </Link>
          )}
        </div>
        <div className="px-8 pb-7">
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start">
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                  <CheckIcon />
                </div>

                <p className="ml-2 text-sm text-gray-800 dark:text-white/90">
                  {feature}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {plan.popular && (
        <GlowGradient className="absolute -left-full top-0 -translate-x-20 max-lg:hidden" />
      )}
    </div>
  );
}

function ContactSalesLink({ children }: PropsWithChildren) {
  return (
    <Link
      href="/contact"
      className="mt-7 block w-full rounded-full bg-gray-700 px-8 py-3.5 text-center text-sm font-medium text-white transition hover:bg-gray-900 dark:bg-white/[0.03] dark:hover:bg-primary-500"
    >
      {children}
    </Link>
  );
}
