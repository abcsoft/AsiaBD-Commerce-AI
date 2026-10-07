'use client';

import { MinusIcon, PlusIcon } from '@/icons/icons';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FaqAccordion() {
  const [activeItem, setActiveItem] = useState<number | null>(1);

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'What exactly does AsiaBD Commerce AI do?',
      answer:
        'It is an AI content and listing suite for e-commerce sellers. You describe a product once, and it generates marketplace-ready titles, SEO descriptions, listing optimizations, ad copy, social captions, support replies, brand voices, and keyword plans - formatted for the marketplace you sell on.',
    },
    {
      id: 2,
      question: 'Which marketplaces are supported?',
      answer:
        'Shopify, Amazon, Etsy, TikTok Shop, and general e-commerce (your own store). Each marketplace has its own formatting rules - title limits, bullet structures, tag conventions, and description styles - and the tools adapt automatically.',
    },
    {
      id: 3,
      question: 'How do credits work?',
      answer:
        'Every account starts with 50 free credits. Each generation costs 1-2 credits (bulk generation costs 1 credit per product). Credits are only deducted when a generation succeeds - failed runs are never charged. You can see your full history in the credit ledger on your dashboard.',
    },
    {
      id: 4,
      question: 'Do I need my own Claude API key?',
      answer:
        'For production use, the operator configures one Anthropic API key server-side - sellers just use the app. Without a configured key, the product runs in demo mode with realistic sample output so you can explore every tool before enabling live generation.',
    },
    {
      id: 5,
      question: 'Can I keep my own brand voice?',
      answer:
        'Yes. The Brand Voice Generator creates a reusable voice profile - tone rules, vocabulary, and sample lines. Save it once, then select it in any other tool and every generation follows it.',
    },
    {
      id: 6,
      question: 'Can I edit, save, and export the results?',
      answer:
        'Everything is editable inline before you use it. Save outputs to your content library, copy them, or export as TXT, JSON, or CSV (for bulk runs). Your saved content stays searchable and reusable.',
    },
    {
      id: 7,
      question: 'Can I cancel anytime? What about refunds?',
      answer:
        'Yes - plans are month-to-month and you can cancel at any time. See the Refund Policy for details on credit refunds. If something is not working as described, contact support and we will make it right.',
    },
  ];

  const toggleItem = (itemId: number) => {
    setActiveItem(activeItem === itemId ? null : itemId);
  };

  return (
    <section id="faq" className="bg-gray-50 py-14 md:py-24 dark:bg-dark-primary">
      <div className="wrapper">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-center text-3xl font-bold text-gray-800 dark:text-white/90 md:text-title-lg">
            Frequently asked questions
          </h2>
          <p className="mx-auto max-w-md leading-6 text-gray-500 dark:text-gray-400">
            Everything sellers usually ask before getting started. Still
            curious? Reach out any time.
          </p>
        </div>
        <div className="mx-auto max-w-[600px]">
          <div className="space-y-4">
            {faqItems.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  item,
  isActive,
  onToggle,
}: {
  item: FAQItem;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 pb-5 dark:border-gray-800">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={onToggle}
        aria-expanded={isActive}
      >
        <span className="text-lg font-medium text-gray-800 dark:text-white/90">
          {item.question}
        </span>
        <span className="ml-6 flex-shrink-0">
          {isActive ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none',
          isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <p className="pt-5 text-base leading-7 text-gray-500 dark:text-gray-400">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
