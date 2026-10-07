'use client';

import { useState } from 'react';
import {
  BILLING_PERIODS,
  BILLING_PLANS,
} from '@/components/sections/pricing/data';
import { cn } from '@/lib/utils';
import { PricingCard } from '@/components/sections/pricing/card';

type BillingPeriodKey = (typeof BILLING_PERIODS)[number]['key'];

export default function PricingSection() {
  const [activeBillingPeriodKey, setActiveBillingPeriodKey] =
    useState<BillingPeriodKey>('monthly');

  return (
    <section className="dark:bg-linear-180 bg-gray-50 py-14 dark:from-white/3 dark:from-[45.56%] dark:to-white/0 md:py-30 dark:bg-[#171f2e]">
      <div className="wrapper">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-center text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            Simple pricing for every stage of your store
          </h2>
          <p className="mx-auto max-w-xl leading-6 text-gray-500 dark:text-gray-400">
            Start free and upgrade when you are publishing every day. Credits
            are only charged when a generation succeeds - never for failures.
          </p>
        </div>

        <div>
          {/* Billing Toggle */}
          <div className="relative z-30 mt-12 flex justify-center">
            <div className="relative flex rounded-full bg-white p-1 shadow-theme-xs dark:bg-[#1D2939]">
              {BILLING_PERIODS.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setActiveBillingPeriodKey(period.key)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 dark:text-gray-400',
                    {
                      'bg-gray-800 text-white dark:bg-white/[0.05] dark:text-white':
                        period.key === activeBillingPeriodKey,
                      'pr-2': period.saving,
                    }
                  )}
                >
                  {period.label}

                  {period.saving && (
                    <span className="rounded-full bg-orange-400 px-2 py-0.5 text-xs text-white">
                      Save {period.saving}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-30 mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-6xl lg:grid-cols-3 xl:grid-cols-4">
            {BILLING_PLANS.map((plan, index) => (
              <PricingCard
                key={index}
                plan={plan}
                billingPeriod={activeBillingPeriodKey}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
