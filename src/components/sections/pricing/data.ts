export const BILLING_PERIODS = [
  {
    label: 'Monthly',
    key: 'monthly',
    saving: null,
  },
  {
    label: 'Annually',
    key: 'yearly',
    saving: '20%',
  },
] as const;

const AMOUNTS = {
  starter: {
    monthly: 0,
    yearly: 0,
  },
  growth: {
    monthly: 19,
    yearly: 182,
  },
  pro: {
    monthly: 49,
    yearly: 470,
  },
  agency: {
    monthly: null,
    yearly: null,
  },
};

export type TBILLING_PLAN = (typeof BILLING_PLANS)[number];
export const BILLING_PLANS = [
  {
    name: 'Starter',
    description:
      'For new sellers testing the waters - every core tool with welcome credits.',
    pricing: {
      monthly: {
        amount: AMOUNTS['starter']['monthly'],
        formattedPrice: '$' + AMOUNTS['starter']['monthly'],
      },
      yearly: {
        amount: AMOUNTS['starter']['yearly'],
        formattedPrice: '$' + AMOUNTS['starter']['yearly'],
      },
    },
    features: [
      'All nine AI tools',
      '50 welcome credits',
      'Marketplace-aware output formats',
      'Saved content library',
      'Demo mode + live Claude when configured',
    ],
    cta: 'Start free',
    ctaHref: '/dashboard',
    popular: false,
  },
  {
    name: 'Growth',
    description:
      'For active sellers publishing across multiple marketplaces every week.',
    pricing: {
      monthly: {
        amount: AMOUNTS['growth']['monthly'],
        formattedPrice: '$' + AMOUNTS['growth']['monthly'],
      },
      yearly: {
        amount: AMOUNTS['growth']['yearly'],
        formattedPrice: '$' + AMOUNTS['growth']['yearly'],
      },
    },
    features: [
      'Everything in Starter',
      '1,500 credits / month',
      'Etsy & TikTok Shop formatting',
      'Bulk generation - up to 10 products per run',
      'Brand voice profiles',
      'Email support',
    ],
    cta: 'Choose Growth',
    ctaHref: '/dashboard',
    popular: true,
  },
  {
    name: 'Professional',
    description:
      'For teams and power sellers who publish daily and export everywhere.',
    pricing: {
      monthly: {
        amount: AMOUNTS['pro']['monthly'],
        formattedPrice: '$' + AMOUNTS['pro']['monthly'],
      },
      yearly: {
        amount: AMOUNTS['pro']['yearly'],
        formattedPrice: '$' + AMOUNTS['pro']['yearly'],
      },
    },
    features: [
      'Everything in Growth',
      '5,000 credits / month',
      'Advanced exports - CSV & JSON',
      'Priority generation queue',
      'Multiple brand voices',
      'Priority support',
    ],
    cta: 'Go Professional',
    ctaHref: '/dashboard',
    popular: false,
  },
  {
    name: 'Agency',
    description:
      'For agencies and multi-store operations with high-volume needs.',
    pricing: {
      monthly: {
        amount: AMOUNTS['agency']['monthly'],
        formattedPrice: "Let's talk",
      },
      yearly: {
        amount: AMOUNTS['agency']['yearly'],
        formattedPrice: "Let's talk",
      },
    },
    features: [
      'Unlimited seats',
      'Custom credit pools',
      'Onboarding & template setup',
      'Dedicated support channel',
    ],
    cta: 'Contact sales',
    ctaHref: '/contact',
    popular: false,
  },
];
